-- =========================================================================
-- DEMO SEED DATA — for local/staging preview only, NOT for production.
--
-- Populates a handful of realistic hotel/homestay listings so you can see
-- the guest-facing site (homepage, browse pages, listing detail) with real
-- content instead of empty states. Uses picsum.photos placeholder images —
-- swap for real photos in Supabase Storage before going live.
--
-- Prerequisite: sign up ONE account through the app at /signup using the
-- email below, BEFORE running this script. That gives you a real,
-- correctly-formed auth.users + profiles row via Supabase Auth itself,
-- rather than this script hand-crafting one (which is fragile across
-- GoTrue schema versions). This script then promotes that account to a
-- verified host and attaches listings to it.
--
--   Email:    demo-host@dheysa.com
--   Password: (whatever you choose at signup)
--
-- Run with: supabase db execute -f supabase/seed.sql
-- or paste into the Supabase SQL Editor.
--
-- Does NOT seed bookings or reviews — those require a second real guest
-- account and go through the actual booking flow (RLS + the booking
-- triggers own that logic; faking them here would defeat the point).
-- Re-running is safe: every insert is idempotent (checks for existing
-- rows / uses ON CONFLICT DO NOTHING).
-- =========================================================================

-- These triggers gate "who can publish/feature a listing" to admins only
-- (see supabase/migrations/20260822000000_init_schema.sql). Seeding via
-- SQL Editor has no authenticated session (auth.uid() is null), so they'd
-- otherwise silently downgrade every listing to pending_review. Disable
-- them for the duration of this script only.
alter table public.profiles disable trigger user;
alter table public.listings disable trigger user;

do $$
declare
  v_host_user_id uuid;
  v_host_id uuid;
  v_mindful_cat uuid;
  v_family_cat uuid;
  v_listing_id uuid;
  v_day date;
begin
  select id into v_host_user_id from auth.users where email = 'demo-host@dheysa.com';
  if v_host_user_id is null then
    raise exception 'No user with email demo-host@dheysa.com found. Sign up at /signup with that email first, then re-run this script.';
  end if;

  update public.profiles
    set role = 'host', full_name = coalesce(nullif(full_name, ''), 'Tashi Wangmo')
    where id = v_host_user_id;

  if not exists (select 1 from public.hosts where user_id = v_host_user_id) then
    insert into public.hosts (id, user_id, business_name, bio, verification_status)
    values (
      gen_random_uuid(), v_host_user_id, 'Gelephu Riverside Hospitality',
      'A family-run hospitality group based in Gelephu, hosting travelers across GMC since the city''s founding.',
      'verified'
    );
  end if;
  select id into v_host_id from public.hosts where user_id = v_host_user_id;

  -- ---- categories ------------------------------------------------------
  insert into public.categories (id, name, slug, type, description)
  values
    (gen_random_uuid(), 'Mindfulness Retreats', 'mindfulness-retreats', 'curated',
     'Stays built around quiet, reflection, and nature.'),
    (gen_random_uuid(), 'Family Friendly', 'family-friendly', 'curated',
     'Spacious stays that work well for families.')
  on conflict (slug) do nothing;
  select id into v_mindful_cat from public.categories where slug = 'mindfulness-retreats';
  select id into v_family_cat from public.categories where slug = 'family-friendly';

  -- ---- listing 1: hotel --------------------------------------------------
  if not exists (select 1 from public.listings where slug = 'riverside-serenity-hotel') then
    insert into public.listings (id, host_id, type, title, slug, description, location, images, price_base, currency, status, curated_by_admin, featured)
    values (
      gen_random_uuid(), v_host_id, 'hotel', 'Riverside Serenity Hotel', 'riverside-serenity-hotel',
      'A calm, modern hotel on the banks of the Gelephu river, ten minutes from the mindfulness gardens. Every room looks out over water or forest.',
      'Riverside, GMC',
      array['https://picsum.photos/id/1040/1200/800','https://picsum.photos/id/1041/1200/800','https://picsum.photos/id/1043/1200/800'],
      3800, 'BTN', 'published', true, true
    ) returning id into v_listing_id;

    insert into public.listing_details (listing_id, details) values (
      v_listing_id, jsonb_build_object(
        'amenities', array['Free WiFi','River view','Breakfast included','Meditation room','Air conditioning'],
        'room_count', 24, 'max_guests', 3
      )
    );
    insert into public.listing_categories (listing_id, category_id) values (v_listing_id, v_mindful_cat);

    for v_day in select generate_series(current_date, current_date + interval '44 days', interval '1 day')::date loop
      insert into public.availability (listing_id, date, slots_available) values (v_listing_id, v_day, 4)
      on conflict (listing_id, date) do nothing;
    end loop;
  end if;

  -- ---- listing 2: hotel --------------------------------------------------
  if not exists (select 1 from public.listings where slug = 'gmc-town-centre-inn') then
    insert into public.listings (id, host_id, type, title, slug, description, location, images, price_base, currency, status, curated_by_admin, featured)
    values (
      gen_random_uuid(), v_host_id, 'hotel', 'GMC Town Centre Inn', 'gmc-town-centre-inn',
      'A straightforward, well-kept inn right in the town centre — walkable to the markets and the main square.',
      'Town Centre, GMC',
      array['https://picsum.photos/id/1029/1200/800','https://picsum.photos/id/1031/1200/800'],
      2200, 'BTN', 'published', false, false
    ) returning id into v_listing_id;

    insert into public.listing_details (listing_id, details) values (
      v_listing_id, jsonb_build_object(
        'amenities', array['Free WiFi','24-hour front desk','Laundry service'],
        'room_count', 16, 'max_guests', 2
      )
    );

    for v_day in select generate_series(current_date, current_date + interval '44 days', interval '1 day')::date loop
      insert into public.availability (listing_id, date, slots_available) values (v_listing_id, v_day, 2)
      on conflict (listing_id, date) do nothing;
    end loop;
  end if;

  -- ---- listing 3: homestay ------------------------------------------------
  if not exists (select 1 from public.listings where slug = 'wangmo-family-homestay') then
    insert into public.listings (id, host_id, type, title, slug, description, location, images, price_base, currency, status, curated_by_admin, featured)
    values (
      gen_random_uuid(), v_host_id, 'homestay', 'Wangmo Family Homestay', 'wangmo-family-homestay',
      'Stay with a local family in a traditional Bhutanese home. Home-cooked meals, a shared courtyard, and genuine conversation.',
      'Hillside District, GMC',
      array['https://picsum.photos/id/1050/1200/800','https://picsum.photos/id/1074/1200/800','https://picsum.photos/id/1080/1200/800'],
      1600, 'BTN', 'published', true, true
    ) returning id into v_listing_id;

    insert into public.listing_details (listing_id, details) values (
      v_listing_id, jsonb_build_object(
        'amenities', array['Home-cooked meals','Shared courtyard','Traditional architecture'],
        'house_rules', array['No smoking indoors','Quiet hours after 9pm'],
        'max_guests', 4
      )
    );
    insert into public.listing_categories (listing_id, category_id) values
      (v_listing_id, v_mindful_cat), (v_listing_id, v_family_cat);

    for v_day in select generate_series(current_date, current_date + interval '44 days', interval '1 day')::date loop
      insert into public.availability (listing_id, date, slots_available) values (v_listing_id, v_day, 1)
      on conflict (listing_id, date) do nothing;
    end loop;
  end if;

  -- ---- listing 4: homestay ------------------------------------------------
  if not exists (select 1 from public.listings where slug = 'mindful-garden-homestay') then
    insert into public.listings (id, host_id, type, title, slug, description, location, images, price_base, currency, status, curated_by_admin, featured)
    values (
      gen_random_uuid(), v_host_id, 'homestay', 'Mindful Garden Homestay', 'mindful-garden-homestay',
      'A quiet homestay bordering the mindfulness gardens, with a private meditation corner and organic vegetable garden.',
      'Mindfulness Gardens District, GMC',
      array['https://picsum.photos/id/1015/1200/800','https://picsum.photos/id/1016/1200/800'],
      1900, 'BTN', 'published', false, false
    ) returning id into v_listing_id;

    insert into public.listing_details (listing_id, details) values (
      v_listing_id, jsonb_build_object(
        'amenities', array['Organic garden','Private meditation corner','Free WiFi'],
        'house_rules', array['No pets','Check-in after 2pm'],
        'max_guests', 2
      )
    );
    insert into public.listing_categories (listing_id, category_id) values (v_listing_id, v_mindful_cat);

    for v_day in select generate_series(current_date, current_date + interval '44 days', interval '1 day')::date loop
      insert into public.availability (listing_id, date, slots_available) values (v_listing_id, v_day, 1)
      on conflict (listing_id, date) do nothing;
    end loop;
  end if;

end $$;

alter table public.profiles enable trigger user;
alter table public.listings enable trigger user;
