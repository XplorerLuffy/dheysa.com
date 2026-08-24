-- =========================================================================
-- 1. Host contact info — nothing currently exposes a way for a guest to
--    reach their host. Follows the same public-once-verified visibility
--    business_name/bio already have (hosts_select_verified_or_own_or_admin).
-- =========================================================================

alter table public.hosts add column contact_phone text;

-- =========================================================================
-- 2. Hard, transaction-safe double-booking guard.
--
-- Before this, availability was only checked app-side (SELECT, then a
-- separate INSERT) with no locking in between — two concurrent booking
-- requests for the last open date/room could both pass the check and both
-- insert. The existing adjust_availability_on_booking AFTER-trigger keeps
-- availability.slots_available from going negative (GREATEST(0, ...)),
-- but that only protects the counter — it does nothing to stop the second
-- bookings row from being inserted in the first place.
--
-- This adds a BEFORE INSERT trigger that locks the relevant availability
-- rows with SELECT ... FOR UPDATE and rejects the insert outright if any
-- date in the range is already exhausted. Because it runs inside the same
-- transaction as the client's INSERT, the row lock correctly serializes
-- concurrent attempts: the second transaction blocks until the first
-- commits (or rolls back), then re-reads the now-current count.
--
-- This intentionally does not replace slots_available with a single
-- "is this listing booked" exclusion constraint — hotels have multiple
-- rooms per night, so exclusivity has to be per-unit-count, not per-listing.
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

-- Named to sort before "enforce_booking_rules" so it fires first among
-- same-timing BEFORE INSERT triggers (Postgres runs them in name order);
-- not load-bearing since it only reads new.status/listing_id/dates, which
-- are set by column defaults before any BEFORE trigger runs, but keeping
-- the availability gate first is the clearer order to reason about.
create trigger check_availability_before_booking
  before insert on public.bookings
  for each row execute function public.check_availability_before_booking();

-- Trigger functions can't actually be invoked directly via RPC (Postgres
-- rejects calling a function returning "trigger" outside trigger context),
-- but revoke explicitly anyway, from PUBLIC too since CREATE FUNCTION
-- grants EXECUTE to PUBLIC by default and a role-specific revoke alone
-- doesn't override that.
revoke execute on function public.check_availability_before_booking() from public, anon, authenticated;
