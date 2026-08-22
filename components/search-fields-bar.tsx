'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MapPin, CalendarDays, Users, Search } from 'lucide-react';
import { todayISO, addDays } from '@/lib/format';
import { FormField } from '@/components/form-field';

export function SearchFieldsBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkin') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkout') ?? '');
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    location ? params.set('location', location) : params.delete('location');
    checkIn ? params.set('checkin', checkIn) : params.delete('checkin');
    checkOut ? params.set('checkout', checkOut) : params.delete('checkout');
    guests ? params.set('guests', guests) : params.delete('guests');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-950/5 bg-white p-2.5 shadow-soft"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto]">
        <FormField icon={MapPin} label="Where in GMC">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Any"
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-0"
          />
        </FormField>
        <FormField icon={CalendarDays} label="Check-in">
          <input
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
          />
        </FormField>
        <FormField icon={CalendarDays} label="Check-out">
          <input
            type="date"
            min={checkIn ? addDays(checkIn, 1) : todayISO()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
          />
        </FormField>
        <FormField icon={Users} label="Guests">
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Any"
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-0"
          />
        </FormField>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-brand-950 shadow-soft transition hover:bg-accent-400"
        >
          <Search size={15} strokeWidth={2.5} />
          <span className="sm:hidden">Search</span>
        </button>
      </div>
    </form>
  );
}
