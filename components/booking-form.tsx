'use client';

import { useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createBooking, type BookingFormState } from '@/app/actions/bookings';
import { formatCurrency, nightsBetween, todayISO, addDays } from '@/lib/format';
import type { AvailabilityDay } from '@/lib/data/listings';

const initialState: BookingFormState = { error: null };

export function BookingForm({
  listingId,
  listingSlug,
  priceBase,
  currency,
  maxGuests,
  availability,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: {
  listingId: string;
  listingSlug: string;
  priceBase: number;
  currency: string;
  maxGuests?: number;
  availability: AvailabilityDay[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}) {
  const [state, formAction] = useFormState(createBooking, initialState);
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? '');
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? '');
  const [guests, setGuests] = useState(initialGuests ?? 1);

  const byDate = useMemo(() => new Map(availability.map((d) => [d.date, d])), [availability]);

  const priceInfo = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return null;
    const nights = nightsBetween(checkIn, checkOut);
    let total = 0;
    let cursor = checkIn;
    for (let i = 0; i < nights; i++) {
      const day = byDate.get(cursor);
      if (!day || day.slots_available < 1) {
        return { unavailable: cursor as string };
      }
      total += day.price_override ?? priceBase;
      cursor = addDays(cursor, 1);
    }
    return { nights, total };
  }, [checkIn, checkOut, byDate, priceBase]);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-brand-950/5 p-6 shadow-soft">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="listingSlug" value={listingSlug} />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Check-in
          <input
            type="date"
            name="checkIn"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="rounded-xl border border-brand-950/10 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Check-out
          <input
            type="date"
            name="checkOut"
            min={checkIn ? addDays(checkIn, 1) : todayISO()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="rounded-xl border border-brand-950/10 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Guests
        <input
          type="number"
          name="guests"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          required
          className="rounded-xl border border-brand-950/10 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      {maxGuests && <p className="text-xs text-brand-400">Sleeps up to {maxGuests} guests.</p>}

      <div className="rounded-2xl bg-brand-50 p-4 text-sm">
        {priceInfo && 'unavailable' in priceInfo ? (
          <p className="text-red-600">Not available on {priceInfo.unavailable}. Pick different dates.</p>
        ) : priceInfo ? (
          <div className="flex items-center justify-between">
            <span className="text-brand-600">
              {formatCurrency(priceInfo.total / priceInfo.nights, currency)} × {priceInfo.nights} night
              {priceInfo.nights === 1 ? '' : 's'}
            </span>
            <span className="font-bold text-brand-900">{formatCurrency(priceInfo.total, currency)}</span>
          </div>
        ) : (
          <p className="text-brand-500">Choose your dates to see the total price.</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton disabled={!priceInfo || 'unavailable' in priceInfo} />

      <p className="text-xs text-brand-400">
        Booking creates a 15-minute hold. Payment is by bank transfer — we&apos;ll confirm your
        booking once payment is received.
      </p>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-2xl bg-accent-500 px-4 py-3.5 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-brand-100 disabled:text-brand-400 disabled:shadow-none"
    >
      {pending ? 'Booking…' : 'Confirm booking'}
    </button>
  );
}
