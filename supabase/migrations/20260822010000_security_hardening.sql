-- =========================================================================
-- DheySa — security & performance hardening
--
-- Follow-up to 20260822000000_init_schema.sql, addressing findings from
-- Supabase's advisor lints after the initial migration was applied:
--
-- 1. `set_updated_at` was missing `set search_path = public` (every other
--    function has it) — a mutable search_path on a SECURITY DEFINER-
--    adjacent function is a schema-injection risk.
-- 2. Several SECURITY DEFINER functions are auto-exposed by PostgREST as
--    public RPC endpoints (/rest/v1/rpc/<name>) purely because Postgres
--    grants EXECUTE to PUBLIC by default. Most are `returns trigger`
--    functions Postgres itself refuses to invoke outside a real trigger,
--    so they're noise — but `apply_availability_delta` and
--    `expire_stale_booking_holds` are plain functions anyone (anon
--    included) could call directly. `apply_availability_delta` mutates
--    `availability` as SECURITY DEFINER, i.e. it bypasses RLS entirely —
--    called directly, anyone could inflate or zero out a listing's
--    inventory. Revoking PUBLIC execute closes that; the trigger chain
--    that legitimately calls it still works because a SECURITY DEFINER
--    function's internal calls run as its owner, not the original
--    caller.
--    `is_admin()`/`owns_host()`/`owns_listing()` are deliberately left
--    alone — RLS policies for anon/authenticated call them as part of
--    policy evaluation, so revoking EXECUTE would break every policy
--    that references them, not just close an RPC endpoint.
-- 3. RLS policies calling `auth.uid()` directly get it re-evaluated once
--    per row; wrapping as `(select auth.uid())` lets Postgres cache it
--    once per query (Supabase's documented RLS performance pattern).
-- =========================================================================

-- ---- 1. search_path fix -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---- 2. lock down internal-only functions --------------------------------
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.prevent_role_escalation() from public;
revoke execute on function public.enforce_host_verification_rules() from public;
revoke execute on function public.enforce_listing_publish_rules() from public;
revoke execute on function public.enforce_booking_rules() from public;
revoke execute on function public.adjust_availability_on_booking() from public;
revoke execute on function public.apply_availability_delta(
  uuid, public.listing_type, date, date, date, int, int
) from public;
revoke execute on function public.expire_stale_booking_holds() from public;

-- ---- 3. RLS auth.uid() caching -------------------------------------------
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

drop policy "hosts_insert_self_application" on public.hosts;
create policy "hosts_insert_self_application"
  on public.hosts for insert
  to authenticated
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy "bookings_select_guest_or_host_or_admin" on public.bookings;
create policy "bookings_select_guest_or_host_or_admin"
  on public.bookings for select
  to authenticated
  using (guest_id = (select auth.uid()) or public.owns_host(host_id) or public.is_admin());

drop policy "bookings_insert_guest" on public.bookings;
create policy "bookings_insert_guest"
  on public.bookings for insert
  to authenticated
  with check (guest_id = (select auth.uid()) or public.is_admin());

drop policy "bookings_update_guest_or_host_or_admin" on public.bookings;
create policy "bookings_update_guest_or_host_or_admin"
  on public.bookings for update
  to authenticated
  using (guest_id = (select auth.uid()) or public.owns_host(host_id) or public.is_admin())
  with check (guest_id = (select auth.uid()) or public.owns_host(host_id) or public.is_admin());

drop policy "reviews_insert_after_completed_own_booking" on public.reviews;
create policy "reviews_insert_after_completed_own_booking"
  on public.reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.guest_id = (select auth.uid()) and b.status = 'completed'
    )
  );

drop policy "reviews_update_guest_or_host_or_admin" on public.reviews;
create policy "reviews_update_guest_or_host_or_admin"
  on public.reviews for update
  to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = (select auth.uid()))
    or exists (select 1 from public.bookings b where b.id = booking_id and public.owns_host(b.host_id))
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = (select auth.uid()))
    or exists (select 1 from public.bookings b where b.id = booking_id and public.owns_host(b.host_id))
  );
