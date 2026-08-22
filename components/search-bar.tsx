'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { todayISO, addDays } from '@/lib/format';

export function SearchBar() {
  const router = useRouter();
  const [type, setType] = useState<'hotel' | 'homestay'>('hotel');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (guests) params.set('guests', String(guests));
    router.push(`/${type === 'hotel' ? 'hotels' : 'homestays'}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full max-w-4xl grid-cols-1 gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-lg sm:grid-cols-5"
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Stay type
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'hotel' | 'homestay')}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        >
          <option value="hotel">Hotel</option>
          <option value="homestay">Homestay</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Where in GMC
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Riverside, Town Centre"
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Check-in
        <input
          type="date"
          min={todayISO()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Check-out
        <input
          type="date"
          min={checkIn ? addDays(checkIn, 1) : todayISO()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>

      <div className="flex flex-col gap-1">
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Guests
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
          />
        </label>
        <button
          type="submit"
          className="mt-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
