'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Building2, Home, MapPin, CalendarDays, Users, Search, type LucideIcon } from 'lucide-react';
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
      className="w-full max-w-4xl rounded-3xl border border-brand-950/5 bg-white p-3 shadow-lift"
    >
      <div className="mb-3 flex gap-1 rounded-2xl bg-brand-50 p-1">
        {(
          [
            { value: 'hotel', label: 'Hotels', icon: Building2 },
            { value: 'homestay', label: 'Homestays', icon: Home },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              type === opt.value
                ? 'bg-white text-brand-900 shadow-sm'
                : 'text-brand-500 hover:text-brand-700'
            }`}
          >
            <opt.icon size={16} />
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto]">
        <Field icon={MapPin} label="Where in GMC">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Riverside, Town Centre"
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-0"
          />
        </Field>

        <Field icon={CalendarDays} label="Check-in">
          <input
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
          />
        </Field>

        <Field icon={CalendarDays} label="Check-out">
          <input
            type="date"
            min={checkIn ? addDays(checkIn, 1) : todayISO()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
          />
        </Field>

        <Field icon={Users} label="Guests">
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full border-0 bg-transparent p-0 text-sm text-brand-900 focus:outline-none focus:ring-0"
          />
        </Field>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-3 text-sm font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 sm:px-5"
        >
          <Search size={16} strokeWidth={2.5} />
          <span className="sm:hidden">Search</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-brand-950/5 bg-brand-50/60 px-3.5 py-2.5 transition focus-within:border-brand-300 focus-within:bg-white">
      <Icon size={17} className="shrink-0 text-brand-400" />
      <div className="flex-1 overflow-hidden">
        <p className="text-[11px] font-medium text-brand-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
