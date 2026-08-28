-- =========================================================================
-- Lets a genuine Supabase Dashboard/SQL Editor write approve hosts and
-- publish listings directly, now that the /admin pages are gone from the
-- site and this is how the owner reviews things instead.
--
-- Both enforce_host_verification_rules and enforce_listing_publish_rules
-- gate their privileged fields on is_admin(), which resolves auth.uid()
-- from the request's JWT. A raw Dashboard/SQL Editor session carries no
-- JWT at all, so auth.uid() is null there and is_admin() is unconditionally
-- false — confirmed directly: a plain UPDATE ... set verification_status =
-- 'verified' run outside the app was silently reverted back to 'pending'
-- by the trigger before this fix.
--
-- auth.uid() being null is a safe signal to trust here specifically
-- because it can ONLY happen for a session with no JWT context — i.e. the
-- Dashboard, SQL Editor, or a migration, all of which already require
-- being logged into the Supabase project itself. A real PostgREST request
-- (the only way the public app ever talks to the database) always carries
-- a JWT: authenticated requests carry the caller's own uid, and even the
-- anon role's requests carry an (unauthenticated) JWT — auth.uid() is
-- never null for either. So this can't be used by a logged-in non-admin
-- host to self-verify or self-publish via the API: their own auth.uid()
-- is non-null, so the is_admin() check still applies to them unchanged.
-- =========================================================================

create or replace function public.enforce_host_verification_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status is distinct from old.verification_status
     and not (public.is_admin() or auth.uid() is null) then
    new.verification_status := old.verification_status;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_listing_publish_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
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
