# DheySa

A curated booking marketplace for Gelephu Mindfulness City (GMC), Bhutan — hotels, homestays,
tours/experiences, and transport, all vetted by an admin rather than self-serve.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, Realtime)

## Status

**Phase 0 — schema + scaffold.** No UI beyond a placeholder homepage yet; see
[`supabase/migrations/20260822000000_init_schema.sql`](supabase/migrations/20260822000000_init_schema.sql)
for the full data model, which is intended to be reviewed before Phase 1 UI work starts.

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

## Project layout

```
app/                     Next.js App Router pages
lib/supabase/            Supabase client factories (browser, server, middleware)
types/database.types.ts  Generated (or hand-authored, matching) Postgres types
supabase/migrations/     SQL migrations
```
