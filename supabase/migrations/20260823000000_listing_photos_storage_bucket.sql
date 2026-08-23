-- Bucket for host-uploaded listing photos. Public read (listing images are
-- shown to anyone browsing, same as the existing text[] images column),
-- writes restricted to the authenticated owner's own folder.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "listing_photos_public_read"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'listing-photos');

create policy "listing_photos_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (select auth.uid()::text) = (storage.foldername(name))[1]
  );

create policy "listing_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (select auth.uid()::text) = (storage.foldername(name))[1]
  );
