import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMyBookings } from '@/lib/data/bookings';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDateRange, titleCase } from '@/lib/format';

export default async function TripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/trips');

  const bookings = await getMyBookings();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">My Trips</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-medium text-brand-700">No trips booked yet.</p>
          <p className="mt-1 text-sm text-brand-500">
            <Link href="/hotels" className="underline">
              Browse hotels
            </Link>{' '}
            or{' '}
            <Link href="/homestays" className="underline">
              homestays
            </Link>{' '}
            to plan your visit to GMC.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((booking) => {
            const hasReview = (booking.reviews?.length ?? 0) > 0;
            return (
              <li key={booking.id} className="flex gap-4 rounded-2xl border border-brand-100 p-4">
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                  {booking.listings?.images?.[0] && (
                    <Image
                      src={booking.listings.images[0]}
                      alt={booking.listings.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                      {booking.listings ? titleCase(booking.listings.type) : ''}
                    </p>
                    <Link href={`/trips/${booking.id}`} className="font-semibold text-brand-800 hover:underline">
                      {booking.listings?.title ?? 'Listing'}
                    </Link>
                    <p className="text-sm text-brand-500">
                      {booking.check_in && booking.check_out
                        ? formatDateRange(booking.check_in, booking.check_out)
                        : booking.booking_date}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.payment_status} />
                    </div>
                    <span className="text-sm font-semibold text-brand-800">
                      {formatCurrency(booking.total_price, booking.currency)}
                    </span>
                  </div>
                  {booking.status === 'completed' && !hasReview && (
                    <Link
                      href={`/trips/${booking.id}/review`}
                      className="mt-2 inline-block text-xs font-medium text-brand-700 underline"
                    >
                      Leave a review
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
