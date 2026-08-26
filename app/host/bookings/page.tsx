import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getHostBookings } from '@/lib/data/host';
import { StatusBadge } from '@/components/status-badge';
import { StaggerGroup } from '@/components/motion/stagger-group';
import { formatCurrency, formatDateRange } from '@/lib/format';

export default async function HostBookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/host/bookings');
  if (!user.host) redirect('/host-signup');

  const bookings = await getHostBookings(user.host.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/host/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft size={14} />
        My listings
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-950">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-semibold text-brand-800">No bookings yet.</p>
          <p className="mt-1 text-sm text-brand-500">Bookings for any of your listings will show up here.</p>
        </div>
      ) : (
        <StaggerGroup as="ul" className="mt-6 space-y-4" watch={bookings.map((b) => b.id).join(',')}>
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded-2xl border border-brand-950/5 p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-950">
                    {booking.profiles?.full_name ?? 'Guest'}
                  </p>
                  {booking.listings && (
                    <Link
                      href={`/listings/${booking.listings.slug}`}
                      className="text-sm text-brand-500 hover:underline"
                    >
                      {booking.listings.title}
                    </Link>
                  )}
                  <p className="mt-1 text-sm text-brand-500">
                    {booking.check_in && booking.check_out
                      ? formatDateRange(booking.check_in, booking.check_out)
                      : booking.booking_date}
                    {' · '}
                    {booking.guests_count} guest{booking.guests_count === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm font-bold text-brand-900">
                    {formatCurrency(booking.total_price, booking.currency)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </StaggerGroup>
      )}
    </main>
  );
}
