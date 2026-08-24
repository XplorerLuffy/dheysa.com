'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, todayISO } from '@/lib/format';
import type { AvailabilityDay } from '@/lib/data/listings';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABEL = { month: 'long', year: 'numeric' } as const;

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthCells(monthStart: Date): (Date | null)[] {
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const leading = monthStart.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }
  return cells;
}

// Calendar date-range picker for the booking form. Availability is only
// fetched 60 days out, so the picker is bounded to that same window —
// dates outside it aren't bookable anyway (an absent `availability` row
// is already treated as unavailable by the price/availability check in
// app/actions/bookings.ts).
export function DateRangeCalendar({
  availability,
  checkIn,
  checkOut,
  onChange,
}: {
  availability: AvailabilityDay[];
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const byDate = useMemo(() => new Map(availability.map((d) => [d.date, d])), [availability]);
  const minDate = availability[0]?.date ?? todayISO();
  const maxDate = availability[availability.length - 1]?.date ?? todayISO();
  const minMonth = startOfMonth(new Date(`${minDate}T00:00:00`));
  const maxMonth = startOfMonth(new Date(`${maxDate}T00:00:00`));

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(new Date(`${checkIn || minDate}T00:00:00`))
  );

  const isNightAvailable = (dateStr: string) => {
    const day = byDate.get(dateStr);
    return Boolean(day && day.slots_available > 0);
  };

  // How far forward from checkIn a guest can check out — the first date
  // whose preceding night isn't available (checkout day itself doesn't
  // need a free night, since it isn't stayed).
  const maxCheckoutFor = (start: string): string => {
    let cursor = start;
    while (cursor <= maxDate && isNightAvailable(cursor)) {
      cursor = addDays(cursor, 1);
    }
    return cursor;
  };

  const pickingCheckout = Boolean(checkIn && !checkOut);

  const handleDayClick = (dateStr: string) => {
    if (dateStr < todayISO() || dateStr < minDate || dateStr > maxDate) return;

    if (!pickingCheckout) {
      if (!isNightAvailable(dateStr)) return;
      onChange(dateStr, '');
      return;
    }

    if (dateStr <= checkIn) {
      if (isNightAvailable(dateStr)) onChange(dateStr, '');
      return;
    }

    const maxCheckout = maxCheckoutFor(checkIn);
    if (dateStr > maxCheckout) return;
    onChange(checkIn, dateStr);
  };

  const canGoPrev = viewMonth.getTime() > minMonth.getTime();
  const canGoNext = viewMonth.getTime() < maxMonth.getTime();
  const nextMonth = addMonths(viewMonth, 1);
  const months = nextMonth.getTime() <= maxMonth.getTime() ? [viewMonth, nextMonth] : [viewMonth];

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => canGoPrev && setViewMonth(addMonths(viewMonth, -1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="rounded-full p-1.5 text-brand-500 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => canGoNext && setViewMonth(addMonths(viewMonth, 1))}
          disabled={!canGoNext}
          aria-label="Next month"
          className="rounded-full p-1.5 text-brand-500 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={`mt-1 grid gap-6 ${months.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {months.map((month) => (
          <div key={monthKeyOf(month)}>
            <p className="px-1 text-sm font-semibold text-brand-900">
              {month.toLocaleDateString('en-US', MONTH_LABEL)}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAY_LABELS.map((w, i) => (
                <span key={i} className="text-[10px] font-medium uppercase text-brand-300">
                  {w}
                </span>
              ))}
              {buildMonthCells(month).map((date, i) => {
                if (!date) return <span key={i} />;
                const dateStr = toISO(date);
                const isPast = dateStr < todayISO();
                const inWindow = dateStr >= minDate && dateStr <= maxDate;
                const isCheckIn = dateStr === checkIn;
                const isCheckOut = dateStr === checkOut;
                const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                let selectable: boolean;
                if (!inWindow || isPast) {
                  selectable = false;
                } else if (pickingCheckout) {
                  selectable = dateStr > checkIn ? dateStr <= maxCheckoutFor(checkIn) : isNightAvailable(dateStr);
                } else {
                  selectable = isNightAvailable(dateStr);
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!selectable}
                    onClick={() => handleDayClick(dateStr)}
                    className={[
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition',
                      isCheckIn || isCheckOut
                        ? 'bg-accent-500 font-bold text-brand-950'
                        : inRange
                          ? 'bg-accent-100 text-brand-900'
                          : selectable
                            ? 'text-brand-800 hover:bg-brand-50'
                            : 'cursor-not-allowed text-brand-200 line-through decoration-brand-200',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function monthKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
