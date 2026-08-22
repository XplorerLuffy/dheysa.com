import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
      <h1 className="text-2xl font-bold text-brand-950">My Trips</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-semibold text-brand-800">No trips booked yet.</p>
          <p className="mt-1 text-sm text-brand-500">Plan your visit to Gelephu Mindfulness City.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/hotels"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900"
            >
              Browse hotels <ArrowRight size={14} />
            </Link>
            <Link
              href="/homestays"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-950/10 px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Browse homestays <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((booking) => {
            const hasReview = (booking.reviews?.length ?? 0) > 0;
            return (
              <li
                key={booking.id}
                className="flex gap-4 rounded-2xl border border-brand-950/5 p-4 shadow-soft"
              >
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                      {booking.listings ? titleCase(booking.listings.type) : ''}
                    </p>
                    <Link href={`/trips/${booking.id}`} className="font-bold text-brand-950 hover:underline">
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
                    <span className="text-sm font-bold text-brand-900">
                      {formatCurrency(booking.total_price, booking.currency)}
                    </span>
                  </div>
                  {booking.status === 'completed' && !hasReview && (
                    <Link
                      href={`/trips/${booking.id}/review`}
                      className="mt-2 inline-block text-xs font-semibold text-brand-700 underline underline-offset-2"
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
