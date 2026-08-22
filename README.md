# DheySa

A curated booking marketplace for Gelephu Mindfulness City (GMC), Bhutan — hotels, homestays,
tours/experiences, and transport, all vetted by an admin rather than self-serve.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, Realtime)

## Status

**Phase 1 guest-facing site is built**: homepage, hotel/homestay browse pages (booking.com-style —
property-type tabs, sticky search bar, sidebar filters, list-style results with a review score
badge), listing detail pages, the booking flow (date/guest picker → live price breakdown → 15-minute
hold → manual bank-transfer instructions), My Trips, and post-stay reviews. Email/password auth via
Supabase Auth. See
[`supabase/migrations/20260822000000_init_schema.sql`](supabase/migrations/20260822000000_init_schema.sql)
for the full data model.

Not yet built: the admin curation dashboard and the host dashboard (both call for a signed-in
admin/host area, which hasn't been scoped yet) — see the build order below.

Build order (from the project brief):

1. **Phase 1** — Hotels + homestays, single booking flow, manual payment confirmation, admin-managed hosts
2. **Phase 2** — Tours/experiences as bookable items
3. **Phase 3** — Transport
4. **Phase 4** — Self-service host dashboard + automated payments

## Data model

Tables: `profiles`, `hosts`, `categories`, `listings`, `listing_details`, `availability`,
`bookings`, `reviews`, `listing_categories`.

Notable design decisions baked into the migration:

- **`listings` is polymorphic** across all 4 types (`hotel`/`homestay`/`tour`/`transport`) via a
  `type` enum; type-specific fields live in `listing_details.details` (jsonb) so Phase 2/3 don't
  need a schema migration.
- **Curation is enforced in the database, not just the UI.** A trigger
  (`enforce_listing_publish_rules`) silently reverts `status → 'published'`,
  `curated_by_admin`, and `featured` changes from anyone who isn't an admin — a host can create
  and edit drafts and submit for review, but only an admin can actually publish or feature a
  listing. Host verification (`hosts.verification_status`) is admin-only the same way.
- **15-minute booking holds** are a `hold_expires_at` column set automatically on insert
  (`enforce_booking_rules`), plus `expire_stale_booking_holds()` to cancel stale pending
  bookings — wire this to `pg_cron` (commented block at the bottom of the migration) or a
  Supabase Edge Function on a Cron Trigger.
- **Availability inventory is maintained by triggers**, not the application: creating a
  pending/confirmed booking decrements `availability.slots_available` for the relevant date(s)
  (per-night for hotel/homestay, per-seat via `guests_count` for tour/transport); cancelling
  (including hold expiry) releases it back.
- **Payment confirmation is admin-only** (manual bank transfer, v1) — a host can transition a
  booking's `status` (confirm/decline/complete) but not `payment_status`; only an admin can mark
  a booking `paid`.
- **RLS is on for every table.** Public/anon can read published listings, their details,
  availability, and reviews. Guests see and manage only their own bookings. Hosts see/manage
  their own listings and the bookings against them. Admins bypass all of the above via an
  `is_admin()` helper.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL + anon key
```

To apply the schema to a Supabase project (via the CLI, once linked):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Then generate types from the live schema (optional — a hand-authored `types/database.types.ts`
already matches the migration):

```bash
npm run supabase:types
```

Run the dev server:

```bash
npm run dev
```

### Seeing it with real content

Two ways to see the site populated instead of its (correct) empty states:

**Demo mode — no Supabase project needed at all.** Set `NEXT_PUBLIC_DEMO_MODE=true` in
`.env.local` (see `.env.local.example`) and rebuild. The homepage, browse pages, and listing
detail pages show sample hotel/homestay listings — including reviews and score badges — entirely
in-memory (`lib/data/demo-data.ts`), no database involved. Note it's a `NEXT_PUBLIC_` var, so it
must be set *before* `next build`, not just before `next start` — Next.js inlines these at build
time, so setting it only at runtime (e.g. after deploying) won't do anything. Scope: read-only
listing display only — auth, booking, and My Trips still need a real Supabase project, so "Book
now" on a demo listing won't complete (there's no real row behind it). Turn it off once your own
listings are live.

**Seed data — for testing against your real Supabase project.**

1. Sign up one account through the running app at `/signup` using the email
   `demo-host@dheysa.com` (any password).
2. Run [`supabase/seed.sql`](supabase/seed.sql) against your project (SQL Editor, or
   `supabase db execute -f supabase/seed.sql`). It promotes that account to a verified host and
   adds a handful of hotel/homestay listings with availability, using picsum.photos placeholder
   images.

It deliberately doesn't seed bookings or reviews — those go through the real booking flow (RLS
and the booking triggers own that logic) — so sign up a second guest account and book something
to see a review's score badge show up.

If you added listings some other way (e.g. directly in the Supabase Table Editor) and they're not
showing up: check `select title, status, featured from public.listings;` — a trigger
(`enforce_listing_publish_rules`) silently reverts `status` to `pending_review` for anything not
inserted/updated by an authenticated admin session, which the Table Editor doesn't provide. The
seed script works around this by disabling that trigger for its own duration; a manual dashboard
edit doesn't. Also note the homepage's "Featured stays" section only shows listings with
`featured = true` — everything else (published but not featured) shows up on `/hotels` and
`/homestays` instead.

## Project layout

```
app/                     Next.js App Router pages
components/              Shared UI (search bar, listing cards/list rows, forms, etc.)
lib/data/                Server-side data-fetching (listings, bookings)
lib/supabase/            Supabase client factories (browser, server, middleware)
types/database.types.ts  Generated (or hand-authored, matching) Postgres types
supabase/migrations/     SQL migrations
supabase/seed.sql        Optional demo data for local/staging preview
```
