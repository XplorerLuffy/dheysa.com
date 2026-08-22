'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { nightsBetween } from '@/lib/format';

export type BookingFormState = { error: string | null };

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const listingId = String(formData.get('listingId') ?? '');
  const checkIn = String(formData.get('checkIn') ?? '');
  const checkOut = String(formData.get('checkOut') ?? '');
  const guests = Number(formData.get('guests') ?? 1);
  const listingSlug = String(formData.get('listingSlug') ?? '');

  if (!listingId || !checkIn || !checkOut) {
    return { error: 'Choose your dates before booking.' };
  }
  if (checkOut <= checkIn) {
    return { error: 'Check-out must be after check-in.' };
  }
  if (!Number.isFinite(guests) || guests < 1) {
    return { error: 'Enter a valid number of guests.' };
  }

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch (error) {
    console.error('createBooking: failed to init Supabase client:', error);
    return { error: 'Booking is temporarily unavailable. Please try again shortly.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/listings/${listingSlug}/book`);
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, host_id, price_base, currency, status, type')
    .eq('id', listingId)
    .eq('status', 'published')
    .single();

  if (listingError || !listing) {
    return { error: 'This listing is no longer available.' };
  }

  const { data: details } = await supabase
    .from('listing_details')
    .select('details')
    .eq('listing_id', listingId)
    .maybeSingle();

  const maxGuests = (details?.details as { max_guests?: number } | undefined)?.max_guests;
  if (typeof maxGuests === 'number' && guests > maxGuests) {
    return { error: `This listing sleeps up to ${maxGuests} guests.` };
  }

  const { data: availability, error: availabilityError } = await supabase
    .from('availability')
    .select('date, slots_available, price_override')
    .eq('listing_id', listingId)
    .gte('date', checkIn)
    .lt('date', checkOut);

  if (availabilityError) {
    return { error: 'Could not check availability. Please try again.' };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const byDate = new Map((availability ?? []).map((a) => [a.date, a]));

  let total = 0;
  let cursor = checkIn;
  for (let i = 0; i < nights; i++) {
    const day = byDate.get(cursor);
    if (!day || day.slots_available < 1) {
      return { error: `Not available on ${cursor}. Try different dates.` };
    }
    total += day.price_override ?? listing.price_base;
    const next = new Date(`${cursor}T00:00:00`);
    next.setDate(next.getDate() + 1);
    cursor = next.toISOString().slice(0, 10);
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      guest_id: user!.id,
      listing_id: listing.id,
      host_id: listing.host_id,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guests,
      total_price: total,
      currency: listing.currency,
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    return { error: bookingError?.message ?? 'Could not create the booking. Please try again.' };
  }

  redirect(`/trips/${booking.id}`);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  let failed = false;
  try {
    const supabase = createClient();
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    failed = Boolean(error);
  } catch (error) {
    console.error('cancelBooking failed:', error);
    failed = true;
  }
  redirect(failed ? `/trips/${bookingId}?error=cancel_failed` : `/trips/${bookingId}`);
}
