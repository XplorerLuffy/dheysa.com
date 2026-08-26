export function formatCurrency(amount: number, currency: string = 'BTN'): string {
  const symbol = currency === 'BTN' ? 'Nu.' : currency;
  return `${symbol} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Accepts either a plain "YYYY-MM-DD" date (Postgres `date` columns, e.g.
// availability.date, bookings.check_in) or a full ISO timestamp (Postgres
// `timestamptz` columns, e.g. reviews.created_at) — only the former needs
// a time appended before parsing.
export function formatDate(date: string | Date): string {
  const d =
    typeof date === 'string' ? new Date(date.length <= 10 ? `${date}T00:00:00` : date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// Formats a Date using its *local* calendar fields — never .toISOString(),
// which reports the UTC calendar date instead. Parsing a plain "date"
// string as local midnight (below) and then serializing via
// .toISOString() silently shifts the result back a day for anyone in a
// positive UTC offset (e.g. Bhutan, UTC+6): local midnight is already the
// previous day in UTC. That made addDays(date, 1) return the same date it
// was given — a real, live bug: the booking calendar calls addDays in a
// while-loop to scan forward night by night, and a same-input-same-output
// addDays makes that loop spin forever, freezing the tab the moment a
// check-in date is picked.
function toLocalISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}

export function todayISO(): string {
  return toLocalISODate(new Date());
}

export function titleCase(value: string): string {
  return value.replace(/(^|[_\s])(\w)/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());
}
