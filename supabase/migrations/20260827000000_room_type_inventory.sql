-- =========================================================================
-- Real per-room-type inventory for hotels.
--
-- Previously a hotel's "room types" were just a JSON blob on
-- listing_details (name/price/max_guests/count) shown for description
-- only — every booking against a hotel drew from ONE shared
-- listing-level `availability` pool regardless of which room type the
-- guest actually wanted. Two different room types could each claim
-- availability from the same count, and there was no way to book a
-- specific room type at its own price.
--
-- This adds real tables (room_types, room_type_availability) as the
-- source of truth for hotel booking/availability, migrates any room
-- types already captured in the JSON blob into them, and updates the
-- availability bookkeeping functions/triggers to operate on
-- room_type_availability when a booking targets a specific room type.
-- Homestays are unaffected — they stay on the listing-level
-- `availability` table exactly as before (a homestay is one unit, not a
-- set of room types).
-- =========================================================================

-- =========================================================================
-- 1. Tables
-- =========================================================================

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  max_guests int not null default 2 check (max_guests > 0),
  room_count int not null default 1 check (room_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_room_types_listing_id on public.room_types (listing_id);

create trigger set_updated_at before update on public.room_types
  for each row execute function public.set_updated_at();

create table public.room_type_availability (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types (id) on delete cascade,
  date date not null,
  slots_available int not null default 0 check (slots_available >= 0),
  price_override numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (room_type_id, date)
);

create index idx_room_type_availability_room_type_date on public.room_type_availability (room_type_id, date);

alter table public.bookings add column room_type_id uuid references public.room_types (id) on delete restrict;
create index idx_bookings_room_type_id on public.bookings (room_type_id);

-- =========================================================================
-- 2. RLS — same "public once published, own or admin otherwise" shape as
--    listing_details/availability.
-- =========================================================================

alter table public.room_types enable row level security;
alter table public.room_type_availability enable row level security;

create policy "room_types_select_matches_listing"
  on public.room_types for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'published' or public.owns_listing(l.id) or public.is_admin())
    )
  );

create policy "room_types_write_own_or_admin"
  on public.room_types for insert
  to authenticated
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "room_types_update_own_or_admin"
  on public.room_types for update
  to authenticated
  using (public.owns_listing(listing_id) or public.is_admin())
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "room_types_delete_own_or_admin"
  on public.room_types for delete
  to authenticated
  using (public.owns_listing(listing_id) or public.is_admin());

create policy "room_type_availability_select_matches_listing"
  on public.room_type_availability for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.room_types rt
      join public.listings l on l.id = rt.listing_id
      where rt.id = room_type_id
        and (l.status = 'published' or public.owns_listing(l.id) or public.is_admin())
    )
  );

create policy "room_type_availability_write_own_or_admin"
  on public.room_type_availability for insert
  to authenticated
  with check (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and (public.owns_listing(rt.listing_id) or public.is_admin())
    )
  );

create policy "room_type_availability_update_own_or_admin"
  on public.room_type_availability for update
  to authenticated
  using (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and (public.owns_listing(rt.listing_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and (public.owns_listing(rt.listing_id) or public.is_admin())
    )
  );

create policy "room_type_availability_delete_own_or_admin"
  on public.room_type_availability for delete
  to authenticated
  using (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and (public.owns_listing(rt.listing_id) or public.is_admin())
    )
  );

-- =========================================================================
-- 3. Data migration: JSON room_types -> real rows, plus a default room
--    type for any hotel that had none, so nothing goes from bookable to
--    unbookable the moment this ships.
-- =========================================================================

insert into public.room_types (listing_id, name, price, max_guests, room_count)
select
  ld.listing_id,
  coalesce(nullif(rt->>'name', ''), 'Room'),
  coalesce((rt->>'price')::numeric, l.price_base),
  greatest(coalesce((rt->>'max_guests')::int, 2), 1),
  greatest(coalesce((rt->>'count')::int, 1), 1)
from public.listing_details ld
join public.listings l on l.id = ld.listing_id
cross join lateral jsonb_array_elements(coalesce(ld.details->'room_types', '[]'::jsonb)) as rt
where l.type = 'hotel';

insert into public.room_types (listing_id, name, price, max_guests, room_count)
select
  l.id,
  'Standard Room',
  l.price_base,
  greatest(coalesce((ld.details->>'max_guests')::int, 2), 1),
  greatest(coalesce((ld.details->>'room_count')::int, 1), 1)
from public.listings l
left join public.listing_details ld on ld.listing_id = l.id
where l.type = 'hotel'
  and not exists (select 1 from public.room_types rt where rt.listing_id = l.id);

-- Seed 90 days of availability for every room type that now exists.
insert into public.room_type_availability (room_type_id, date, slots_available)
select rt.id, d::date, rt.room_count
from public.room_types rt
cross join generate_series(current_date, current_date + interval '89 days', interval '1 day') as d
on conflict (room_type_id, date) do nothing;

-- Top up homestay availability to the same 90-day window (they were only
-- seeded 45 days out). Existing rows are untouched (on conflict do nothing)
-- so this only fills in the gap, never resets a day that's already been
-- booked against.
insert into public.availability (listing_id, date, slots_available)
select l.id, d::date, 1
from public.listings l
cross join generate_series(current_date, current_date + interval '89 days', interval '1 day') as d
where l.type = 'homestay'
on conflict (listing_id, date) do nothing;

-- =========================================================================
-- 4. Availability bookkeeping: branch on room_type_id.
-- =========================================================================

drop function if exists public.apply_availability_delta(
  uuid, public.listing_type, date, date, date, int, int
);

create function public.apply_availability_delta(
  p_listing_id uuid,
  p_type public.listing_type,
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date,
  p_booking_date date,
  p_guests int,
  p_delta int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_room_type_id is not null and p_check_in is not null and p_check_out is not null then
    update public.room_type_availability
      set slots_available = greatest(0, slots_available + p_delta)
      where room_type_id = p_room_type_id and date >= p_check_in and date < p_check_out;
  elsif p_type in ('hotel', 'homestay') and p_check_in is not null and p_check_out is not null then
    update public.availability
      set slots_available = greatest(0, slots_available + p_delta)
      where listing_id = p_listing_id and date >= p_check_in and date < p_check_out;
  elsif p_booking_date is not null then
    update public.availability
      set slots_available = greatest(0, slots_available + (p_delta * p_guests))
      where listing_id = p_listing_id and date = p_booking_date;
  end if;
end;
$$;

create or replace function public.adjust_availability_on_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.listing_type;
begin
  select type into v_type from public.listings where id = coalesce(new.listing_id, old.listing_id);

  if TG_OP = 'INSERT' then
    if new.status in ('pending', 'confirmed') then
      perform public.apply_availability_delta(
        new.listing_id, v_type, new.room_type_id, new.check_in, new.check_out, new.booking_date, new.guests_count, -1
      );
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    if old.status in ('pending', 'confirmed') and new.status = 'cancelled' then
      perform public.apply_availability_delta(
        old.listing_id, v_type, old.room_type_id, old.check_in, old.check_out, old.booking_date, old.guests_count, 1
      );
    elsif old.status = 'cancelled' and new.status in ('pending', 'confirmed') then
      perform public.apply_availability_delta(
        new.listing_id, v_type, new.room_type_id, new.check_in, new.check_out, new.booking_date, new.guests_count, -1
      );
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.status in ('pending', 'confirmed') then
      perform public.apply_availability_delta(
        old.listing_id, v_type, old.room_type_id, old.check_in, old.check_out, old.booking_date, old.guests_count, 1
      );
    end if;
    return old;
  end if;
  return null;
end;
$$;

-- =========================================================================
-- 5. Transaction-safe double-booking guard: same FOR UPDATE locking
--    approach as before, now against room_type_availability when the
--    booking targets a room type.
-- =========================================================================

create or replace function public.check_availability_before_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.listing_type;
  v_day date;
  v_slots int;
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  if new.room_type_id is not null and new.check_in is not null and new.check_out is not null then
    v_day := new.check_in;
    while v_day < new.check_out loop
      select slots_available into v_slots
        from public.room_type_availability
        where room_type_id = new.room_type_id and date = v_day
        for update;

      if v_slots is null or v_slots < 1 then
        raise exception 'No availability on %. Try different dates.', v_day
          using errcode = '23505';
      end if;

      v_day := v_day + 1;
    end loop;
    return new;
  end if;

  select type into v_type from public.listings where id = new.listing_id;

  if v_type in ('hotel', 'homestay') and new.check_in is not null and new.check_out is not null then
    v_day := new.check_in;
    while v_day < new.check_out loop
      select slots_available into v_slots
        from public.availability
        where listing_id = new.listing_id and date = v_day
        for update;

      if v_slots is null or v_slots < 1 then
        raise exception 'No availability on %. Try different dates.', v_day
          using errcode = '23505';
      end if;

      v_day := v_day + 1;
    end loop;
  elsif new.booking_date is not null then
    select slots_available into v_slots
      from public.availability
      where listing_id = new.listing_id and date = new.booking_date
      for update;

    if v_slots is null or v_slots < new.guests_count then
      raise exception 'No availability on %. Try a different date.', new.booking_date
        using errcode = '23505';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.apply_availability_delta(
  uuid, public.listing_type, uuid, date, date, date, int, int
) from public, anon, authenticated;
