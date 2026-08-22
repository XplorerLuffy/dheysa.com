'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Building2, Home, Compass, Car, MapPin, CalendarDays, Users, Search } from 'lucide-react';
import { todayISO, addDays } from '@/lib/format';
import { TypeTabRow, type TypeTabItem } from '@/components/type-tab-row';

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

  const tabs: TypeTabItem[] = [
    { label: 'Hotels', icon: Building2, active: type === 'hotel', onClick: () => setType('hotel') },
    { label: 'Homestays', icon: Home, active: type === 'homestay', onClick: () => setType('homestay') },
    { label: 'Tours', icon: Compass, disabled: true },
    { label: 'Transport', icon: Car, disabled: true },
  ];

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <TypeTabRow items={tabs} tone="dark" bare />

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-4 ring-accent-400/40 sm:flex-row sm:rounded-full"
      >
        <label className="flex flex-1 items-center gap-3 border-b border-brand-100 px-5 py-3.5 sm:border-b-0 sm:border-r">
          <MapPin size={18} className="shrink-0 text-brand-400" />
          <span className="flex-1 text-left">
            <span className="block text-[11px] font-semibold text-brand-900">Where in GMC</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search destinations"
              className="w-full border-0 bg-transparent p-0 text-sm text-brand-700 placeholder:text-brand-300 focus:outline-none focus:ring-0"
            />
          </span>
        </label>

        <label className="flex flex-1 items-center gap-3 border-b border-brand-100 px-5 py-3.5 sm:border-b-0 sm:border-r">
          <CalendarDays size={18} className="shrink-0 text-brand-400" />
          <span className="flex-1 text-left">
            <span className="block text-[11px] font-semibold text-brand-900">Check-in</span>
            <input
              type="date"
              min={todayISO()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm text-brand-700 focus:outline-none focus:ring-0"
            />
          </span>
        </label>

        <label className="flex flex-1 items-center gap-3 border-b border-brand-100 px-5 py-3.5 sm:border-b-0 sm:border-r">
          <CalendarDays size={18} className="shrink-0 text-brand-400" />
          <span className="flex-1 text-left">
            <span className="block text-[11px] font-semibold text-brand-900">Check-out</span>
            <input
              type="date"
              min={checkIn ? addDays(checkIn, 1) : todayISO()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm text-brand-700 focus:outline-none focus:ring-0"
            />
          </span>
        </label>

        <label className="flex items-center gap-3 px-5 py-3.5 sm:w-40">
          <Users size={18} className="shrink-0 text-brand-400" />
          <span className="flex-1 text-left">
            <span className="block text-[11px] font-semibold text-brand-900">Guests</span>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full border-0 bg-transparent p-0 text-sm text-brand-700 focus:outline-none focus:ring-0"
            />
          </span>
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-accent-500 px-8 py-4 text-sm font-bold text-brand-950 transition hover:bg-accent-400 sm:rounded-r-full"
        >
          <Search size={16} strokeWidth={2.5} />
          Search
        </button>
      </form>
    </div>
  );
}
