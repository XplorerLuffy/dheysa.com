'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { nightsBetween, addDays } from '@/lib/format';
import { sendBookingConfirmationEmail } from '@/lib/email';

export type BookingFormState = { error: string | null };

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const listingId = String(formData.get('listingId') ?? '');
  const roomTypeId = String(formData.get('roomTypeId') ?? '') || null;
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
    .select('id, host_id, title, location, price_base, currency, status, type')
    .eq('id', listingId)
    .eq('status', 'published')
    .single();

  if (listingError || !listing) {
    return { error: 'This listing is no longer available.' };
  }

  let roomType: { id: string; name: string; price: number; max_guests: number } | null = null;
  if (roomTypeId) {
    const { data: rt } = await supabase
      .from('room_types')
      .select('id, name, price, max_guests, listing_id')
      .eq('id', roomTypeId)
      .maybeSingle();
    if (!rt || rt.listing_id !== listingId) {
      return { error: 'That room is no longer available on this listing.' };
    }
    roomType = rt;
  }

  const maxGuests = roomType
    ? roomType.max_guests
    : ((
        await supabase.from('listing_details').select('details').eq('listing_id', listingId).maybeSingle()
      ).data?.details as { max_guests?: number } | undefined)?.max_guests;

  if (typeof maxGuests === 'number' && guests > maxGuests) {
    return { error: `This ${roomType ? 'room' : 'listing'} sleeps up to ${maxGuests} guests.` };
  }

  const { data: availability, error: availabilityError } = roomType
    ? await supabase
        .from('room_type_availability')
        .select('date, slots_available, price_override')
        .eq('room_type_id', roomType.id)
        .gte('date', checkIn)
        .lt('date', checkOut)
    : await supabase
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
  const basePrice = roomType ? roomType.price : listing.price_base;

  let total = 0;
  let cursor = checkIn;
  for (let i = 0; i < nights; i++) {
    const day = byDate.get(cursor);
    if (!day || day.slots_available < 1) {
      return { error: `Not available on ${cursor}. Try different dates.` };
    }
    total += day.price_override ?? basePrice;
    cursor = addDays(cursor, 1);
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      guest_id: user!.id,
      listing_id: listing.id,
      room_type_id: roomType?.id ?? null,
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

  try {
    const { data: host } = await supabase
      .from('hosts')
      .select('business_name, contact_phone')
      .eq('id', listing.host_id)
      .maybeSingle();

    if (user!.email) {
      await sendBookingConfirmationEmail({
        to: user!.email,
        listingTitle: listing.title,
        roomTypeName: roomType?.name ?? null,
        listingLocation: listing.location,
        checkIn,
        checkOut,
        bookingDate: null,
        guests,
        totalPrice: total,
        currency: listing.currency,
        bookingId: booking.id,
        hostBusinessName: host?.business_name ?? null,
        hostContactPhone: host?.contact_phone ?? null,
      });
    }
  } catch (error) {
    console.error('sendBookingConfirmationEmail failed:', error);
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
