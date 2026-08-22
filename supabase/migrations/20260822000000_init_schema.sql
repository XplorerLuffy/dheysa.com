-- =========================================================================
-- DheySa — Gelephu Mindfulness City booking marketplace
-- Initial schema: tables, indexes, triggers, and RLS policies
--
-- Phase scope: hotels + homestays first, but the schema is built to also
-- carry tours/experiences and transport (Phase 2 & 3) without migration
-- churn — `listings.type` and `listing_details.details` (jsonb) already
-- cover the type-specific fields.
-- =========================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- =========================================================================
-- 1. ENUMS
-- =========================================================================

create type public.user_role as enum ('guest', 'host', 'admin');
create type public.host_verification_status as enum ('pending', 'verified', 'rejected');
create type public.listing_type as enum ('hotel', 'homestay', 'tour', 'transport');
create type public.listing_status as enum ('draft', 'pending_review', 'published', 'archived');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type public.payment_status as enum ('pending', 'paid', 'refunded');

-- =========================================================================
-- 2. TABLES
-- =========================================================================

-- Extends auth.users. One row per authenticated user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A host business/person. A profile becomes a host by applying (inserting
-- here); admin verification gates publishing, not row creation.
create table public.hosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  business_name text not null,
  bio text,
  verification_status public.host_verification_status not null default 'pending',
  payout_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Curated collections / filters, e.g. "mindfulness-focused", "family-friendly".
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text,
  description text,
  created_at timestamptz not null default now()
);

-- Polymorphic listing header shared by all 4 listing types.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts (id) on delete cascade,
  type public.listing_type not null,
  title text not null,
  slug text not null unique,
  description text,
  location text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  images text[] not null default '{}',
  price_base numeric(10, 2) not null check (price_base >= 0),
  currency text not null default 'BTN',
  status public.listing_status not null default 'draft',
  curated_by_admin boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Type-specific attributes kept flexible in jsonb so Phase 2/3 listing
-- types (tour, transport) don't need a schema migration.
-- Expected shapes (informal, not enforced):
--   hotel/homestay: { amenities: string[], room_count, max_guests, house_rules, bedrooms, bathrooms }
--   tour:           { group_size_min, group_size_max, duration_hours, itinerary, meeting_point }
--   transport:      { vehicle_type, seats, route, one_way }
create table public.listing_details (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  details jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Per-day (or per-date) inventory. For hotel/homestay, slots_available is
-- units (rooms/houses) open that night. For tour/transport, it's seats.
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  date date not null,
  slots_available int not null default 0 check (slots_available >= 0),
  price_override numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (listing_id, date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete restrict,
  host_id uuid not null references public.hosts (id) on delete restrict,
  check_in date,
  check_out date,
  booking_date date,
  guests_count int not null default 1 check (guests_count > 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  currency text not null default 'BTN',
  status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_method text,
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_has_exactly_one_date_shape check (
    (check_in is not null and check_out is not null and booking_date is null and check_out > check_in)
    or (check_in is null and check_out is null and booking_date is not null)
  )
);

-- One review per completed booking.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  host_response text,
  created_at timestamptz not null default now()
);

create table public.listing_categories (
  listing_id uuid not null references public.listings (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (listing_id, category_id)
);

-- =========================================================================
-- 3. INDEXES
-- =========================================================================

create index idx_hosts_user_id on public.hosts (user_id);
create index idx_hosts_verification_status on public.hosts (verification_status);

create index idx_listings_type_status on public.listings (type, status);
create index idx_listings_host_id on public.listings (host_id);
create index idx_listings_featured on public.listings (featured) where featured;
create index idx_listings_location on public.listings using gin (to_tsvector('simple', location));

create index idx_availability_listing_date on public.availability (listing_id, date);

create index idx_bookings_guest_id on public.bookings (guest_id);
create index idx_bookings_listing_id on public.bookings (listing_id);
create index idx_bookings_host_id on public.bookings (host_id);
create index idx_bookings_status on public.bookings (status);
create index idx_bookings_pending_holds on public.bookings (hold_expires_at) where status = 'pending';

create index idx_reviews_booking_id on public.reviews (booking_id);
create index idx_listing_categories_category_id on public.listing_categories (category_id);

-- =========================================================================
-- 4. HELPER FUNCTIONS (security definer — bypass RLS for role checks so
--    policies referencing them don't recurse into themselves)
-- =========================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.owns_host(p_host_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.hosts h
    where h.id = p_host_id and h.user_id = auth.uid()
  );
$$;

create or replace function public.owns_listing(p_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listings l
    join public.hosts h on h.id = l.host_id
    where l.id = p_listing_id and h.user_id = auth.uid()
  );
$$;

-- =========================================================================
-- 5. TRIGGERS
-- =========================================================================

-- 5.1 generic updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.hosts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.listings
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.listing_details
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- 5.2 auto-create a profile row when someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'guest')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5.3 only an admin may change profiles.role (blocks self-promotion to admin)
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger prevent_role_escalation before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- 5.4 only an admin may change a host's verification_status
create or replace function public.enforce_host_verification_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status is distinct from old.verification_status and not public.is_admin() then
    new.verification_status := old.verification_status;
  end if;
  return new;
end;
$$;

create trigger enforce_host_verification_rules before update on public.hosts
  for each row execute function public.enforce_host_verification_rules();

-- 5.5 curation gate: only an admin may publish, feature, or mark a listing
--     admin-curated. Hosts can freely create/edit drafts and submit for review.
create or replace function public.enforce_listing_publish_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    if new.status = 'published' then
      new.status := 'pending_review';
    end if;
    new.curated_by_admin := false;
    new.featured := false;
  elsif TG_OP = 'UPDATE' then
    if new.status = 'published' and old.status is distinct from 'published' then
      new.status := 'pending_review';
    end if;
    new.curated_by_admin := old.curated_by_admin;
    new.featured := old.featured;
  end if;

  return new;
end;
$$;

create trigger enforce_listing_publish_rules before insert or update on public.listings
  for each row execute function public.enforce_listing_publish_rules();

-- 5.6 booking write rules: who may set what, and the 15-minute hold default
create or replace function public.enforce_booking_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    if not public.is_admin() then
      new.guest_id := auth.uid();
      new.status := 'pending';
      new.payment_status := 'pending';
    end if;
    if new.status = 'pending' and new.hold_expires_at is null then
      new.hold_expires_at := now() + interval '15 minutes';
    end if;
    return new;
  end if;

  -- TG_OP = 'UPDATE'
  if public.is_admin() then
    return new;
  elsif public.owns_host(new.host_id) then
    if new.status not in ('confirmed', 'cancelled', 'completed') then
      raise exception 'hosts may only confirm, cancel, or complete bookings';
    end if;
    new.guest_id := old.guest_id;
    new.listing_id := old.listing_id;
    new.host_id := old.host_id;
    new.check_in := old.check_in;
    new.check_out := old.check_out;
    new.booking_date := old.booking_date;
    new.guests_count := old.guests_count;
    new.total_price := old.total_price;
    new.currency := old.currency;
    new.payment_method := old.payment_method;
    -- payment_status stays admin-only (manual bank transfer confirmation)
    new.payment_status := old.payment_status;
    return new;
  elsif old.guest_id = auth.uid() then
    if new.status <> 'cancelled' then
      raise exception 'guests may only cancel their bookings';
    end if;
    new.guest_id := old.guest_id;
    new.listing_id := old.listing_id;
    new.host_id := old.host_id;
    new.check_in := old.check_in;
    new.check_out := old.check_out;
    new.booking_date := old.booking_date;
    new.guests_count := old.guests_count;
    new.total_price := old.total_price;
    new.currency := old.currency;
    new.payment_status := old.payment_status;
    new.payment_method := old.payment_method;
    return new;
  else
    raise exception 'not authorized to modify this booking';
  end if;
end;
$$;

create trigger enforce_booking_rules before insert or update on public.bookings
  for each row execute function public.enforce_booking_rules();

-- 5.7 availability bookkeeping: a pending/confirmed booking holds inventory;
--     cancelling (including hold expiry) releases it back.
create or replace function public.apply_availability_delta(
  p_listing_id uuid,
  p_type public.listing_type,
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
  if p_type in ('hotel', 'homestay') and p_check_in is not null and p_check_out is not null then
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
        new.listing_id, v_type, new.check_in, new.check_out, new.booking_date, new.guests_count, -1
      );
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    if old.status in ('pending', 'confirmed') and new.status = 'cancelled' then
      perform public.apply_availability_delta(
        old.listing_id, v_type, old.check_in, old.check_out, old.booking_date, old.guests_count, 1
      );
    elsif old.status = 'cancelled' and new.status in ('pending', 'confirmed') then
      perform public.apply_availability_delta(
        new.listing_id, v_type, new.check_in, new.check_out, new.booking_date, new.guests_count, -1
      );
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.status in ('pending', 'confirmed') then
      perform public.apply_availability_delta(
        old.listing_id, v_type, old.check_in, old.check_out, old.booking_date, old.guests_count, 1
      );
    end if;
    return old;
  end if;
  return null;
end;
$$;

create trigger adjust_availability_on_booking
  after insert or update or delete on public.bookings
  for each row execute function public.adjust_availability_on_booking();

-- 5.8 scheduled cleanup: release 15-minute holds that were never paid.
--     Call this on a schedule — see bottom of file for pg_cron wiring, or
--     invoke it from a Supabase Edge Function on a Cron Trigger.
create or replace function public.expire_stale_booking_holds()
returns void
language sql
security definer
set search_path = public
as $$
  update public.bookings
  set status = 'cancelled'
  where status = 'pending'
    and hold_expires_at is not null
    and hold_expires_at < now();
$$;

-- =========================================================================
-- 6. ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.hosts enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_details enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.listing_categories enable row level security;

-- ---- profiles --------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ---- hosts -------------------------------------------------------------
create policy "hosts_select_verified_or_own_or_admin"
  on public.hosts for select
  to authenticated, anon
  using (verification_status = 'verified' or public.owns_host(id) or public.is_admin());

create policy "hosts_insert_self_application"
  on public.hosts for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "hosts_update_own_or_admin"
  on public.hosts for update
  to authenticated
  using (public.owns_host(id) or public.is_admin())
  with check (public.owns_host(id) or public.is_admin());

create policy "hosts_delete_admin"
  on public.hosts for delete
  to authenticated
  using (public.is_admin());

-- ---- categories ----------------------------------------------------------
create policy "categories_select_all"
  on public.categories for select
  to authenticated, anon
  using (true);

create policy "categories_write_admin"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

create policy "categories_update_admin"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories_delete_admin"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---- listings --------------------------------------------------------
create policy "listings_select_published_or_own_or_admin"
  on public.listings for select
  to authenticated, anon
  using (status = 'published' or public.owns_listing(id) or public.is_admin());

create policy "listings_insert_own_host"
  on public.listings for insert
  to authenticated
  with check (public.owns_host(host_id) or public.is_admin());

create policy "listings_update_own_or_admin"
  on public.listings for update
  to authenticated
  using (public.owns_listing(id) or public.is_admin())
  with check (public.owns_host(host_id) or public.is_admin());

create policy "listings_delete_own_draft_or_admin"
  on public.listings for delete
  to authenticated
  using ((public.owns_listing(id) and status = 'draft') or public.is_admin());

-- ---- listing_details -------------------------------------------------
create policy "listing_details_select_matches_listing"
  on public.listing_details for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'published' or public.owns_listing(l.id) or public.is_admin())
    )
  );

create policy "listing_details_write_own_or_admin"
  on public.listing_details for insert
  to authenticated
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "listing_details_update_own_or_admin"
  on public.listing_details for update
  to authenticated
  using (public.owns_listing(listing_id) or public.is_admin())
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "listing_details_delete_admin"
  on public.listing_details for delete
  to authenticated
  using (public.is_admin());

-- ---- availability ------------------------------------------------------
create policy "availability_select_matches_listing"
  on public.availability for select
  to authenticated, anon
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'published' or public.owns_listing(l.id) or public.is_admin())
    )
  );

create policy "availability_write_own_or_admin"
  on public.availability for insert
  to authenticated
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "availability_update_own_or_admin"
  on public.availability for update
  to authenticated
  using (public.owns_listing(listing_id) or public.is_admin())
  with check (public.owns_listing(listing_id) or public.is_admin());

create policy "availability_delete_own_or_admin"
  on public.availability for delete
  to authenticated
  using (public.owns_listing(listing_id) or public.is_admin());

-- ---- bookings ----------------------------------------------------------
create policy "bookings_select_guest_or_host_or_admin"
  on public.bookings for select
  to authenticated
  using (guest_id = auth.uid() or public.owns_host(host_id) or public.is_admin());

create policy "bookings_insert_guest"
  on public.bookings for insert
  to authenticated
  with check (guest_id = auth.uid() or public.is_admin());

create policy "bookings_update_guest_or_host_or_admin"
  on public.bookings for update
  to authenticated
  using (guest_id = auth.uid() or public.owns_host(host_id) or public.is_admin())
  with check (guest_id = auth.uid() or public.owns_host(host_id) or public.is_admin());

create policy "bookings_delete_admin"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());

-- ---- reviews -----------------------------------------------------------
create policy "reviews_select_all"
  on public.reviews for select
  to authenticated, anon
  using (true);

create policy "reviews_insert_after_completed_own_booking"
  on public.reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.guest_id = auth.uid() and b.status = 'completed'
    )
  );

create policy "reviews_update_guest_or_host_or_admin"
  on public.reviews for update
  to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = auth.uid())
    or exists (select 1 from public.bookings b where b.id = booking_id and public.owns_host(b.host_id))
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = auth.uid())
    or exists (select 1 from public.bookings b where b.id = booking_id and public.owns_host(b.host_id))
  );

create policy "reviews_delete_admin"
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

-- ---- listing_categories (admin-curated collections) --------------------
create policy "listing_categories_select_all"
  on public.listing_categories for select
  to authenticated, anon
  using (true);

create policy "listing_categories_write_admin"
  on public.listing_categories for insert
  to authenticated
  with check (public.is_admin());

create policy "listing_categories_delete_admin"
  on public.listing_categories for delete
  to authenticated
  using (public.is_admin());

-- =========================================================================
-- 7. OPTIONAL: schedule the 15-minute hold cleanup via pg_cron.
--    Uncomment if the `pg_cron` extension is enabled on this project
--    (Database > Extensions in the Supabase dashboard). Otherwise, call
--    public.expire_stale_booking_holds() from a Supabase Edge Function on
--    a Cron Trigger instead.
-- =========================================================================

-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'expire-booking-holds',
--   '* * * * *',
--   $$select public.expire_stale_booking_holds();$$
-- );
