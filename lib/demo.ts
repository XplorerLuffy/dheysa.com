// Demo mode shows realistic sample listings/reviews without touching
// Supabase at all — useful for previewing the site before a real project
// is connected, or when you just want to see it populated. Toggle with
// NEXT_PUBLIC_DEMO_MODE=true in .env.local (see .env.local.example).
//
// Scope: read-only display data (homepage, browse, listing detail).
// Booking/auth/My Trips still talk to Supabase as normal — a demo
// listing isn't a real row, so "Book now" on one won't complete.
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
