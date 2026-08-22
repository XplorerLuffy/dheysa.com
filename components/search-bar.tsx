'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Building2, Home, Compass, Car, MapPin, CalendarDays, Users, Search } from 'lucide-react';
import { todayISO, addDays } from '@/lib/format';
import { FormField } from '@/components/form-field';
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
    <div className="flex w-full max-w-4xl flex-col items-center gap-3">
      <TypeTabRow items={tabs} tone="dark" />

      <form
        onSubmit={handleSubmit}
        className="w-full rounded-3xl border border-brand-950/5 bg-white p-3 shadow-lift"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto]">
          <FormField icon={MapPin} label="Where in GMC">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Riverside, Town Centre"
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
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
            />
          </FormField>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-3 text-sm font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 sm:px-5"
          >
            <Search size={16} strokeWidth={2.5} />
            <span className="sm:hidden">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
