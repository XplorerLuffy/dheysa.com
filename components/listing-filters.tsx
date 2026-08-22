'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { todayISO, addDays } from '@/lib/format';

export function ListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkin') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkout') ?? '');
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    if (guests) params.set('guests', guests);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-brand-100 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-brand-500 lg:col-span-1">
        Location
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Any"
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Min price
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Max price
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
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
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Update
        </button>
      </div>
    </form>
  );
}
