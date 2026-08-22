-- =========================================================================
-- Fix: reviews were unreadable by anon/public despite reviews_select_all
-- being `using (true)`.
--
-- app code (lib/data/listings.ts) linked a review to its listing via
-- `reviews.select('..., bookings!inner(listing_id)')` — since `reviews`
-- itself has no listing_id column, only booking_id. That embedded join
-- requires SELECT on `bookings` to resolve, and bookings RLS correctly
-- restricts reads to the guest/host/admin involved. For anon (and any
-- other guest/host), the join silently returns zero rows — so the
-- publicly-readable review vanished the moment it was joined through a
-- table it couldn't read. Confirmed directly: `SET ROLE anon; SELECT *
-- FROM reviews` returns the row; joining through bookings returns none.
--
-- Fix: denormalize listing_id onto reviews (auto-populated from the
-- booking on insert, so it can't drift or be spoofed) so public reads
-- never need to touch bookings at all.
-- =========================================================================

alter table public.reviews add column listing_id uuid references public.listings (id) on delete cascade;

update public.reviews r
set listing_id = b.listing_id
from public.bookings b
where b.id = r.booking_id and r.listing_id is null;

alter table public.reviews alter column listing_id set not null;

create index idx_reviews_listing_id on public.reviews (listing_id);

create or replace function public.set_review_listing_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select listing_id into new.listing_id from public.bookings where id = new.booking_id;
  return new;
end;
$$;

create trigger set_review_listing_id before insert on public.reviews
  for each row execute function public.set_review_listing_id();

revoke execute on function public.set_review_listing_id() from anon, authenticated;
