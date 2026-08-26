-- Hosts already have full SELECT access to bookings on their own listings
-- (bookings_select_guest_or_host_or_admin, via owns_host), but profiles is
-- locked to "own row or admin" — so a host reading their own bookings gets
-- guest_id but no name to show for who's arriving. This adds a narrow,
-- read-only allowance: a host can see the full_name of a guest who has (or
-- had) a booking with one of the host's listings. Nothing else on the
-- guest's profile (phone, role) is exposed by this — full_name is the only
-- column the host dashboard reads.
create policy "profiles_select_by_host_via_booking"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.guest_id = profiles.id
        and public.owns_host(b.host_id)
    )
  );
