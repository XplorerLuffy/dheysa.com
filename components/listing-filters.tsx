'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MapPin, CalendarDays, SlidersHorizontal, type LucideIcon } from 'lucide-react';
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
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-brand-950/5 bg-white p-3 shadow-soft"
    >
      <Field icon={MapPin} label="Location">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Any"
          className="w-32 border-0 bg-transparent p-0 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-0"
        />
      </Field>
      <Field label="Min price">
        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
        />
      </Field>
      <Field label="Max price">
        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
        />
      </Field>
      <Field icon={CalendarDays} label="Check-in">
        <input
          type="date"
          min={todayISO()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-32 border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
        />
      </Field>
      <Field icon={CalendarDays} label="Check-out">
        <input
          type="date"
          min={checkIn ? addDays(checkIn, 1) : todayISO()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-32 border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
        />
      </Field>
      <button
        type="submit"
        className="ml-auto flex items-center gap-1.5 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        <SlidersHorizontal size={14} />
        Update
      </button>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-brand-950/5 bg-brand-50/60 px-3 py-2 transition focus-within:border-brand-300 focus-within:bg-white">
      {Icon && <Icon size={15} className="shrink-0 text-brand-400" />}
      <div>
        <p className="text-[10px] font-medium text-brand-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
