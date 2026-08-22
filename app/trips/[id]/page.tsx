import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Building2, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getBookingById } from '@/lib/data/bookings';
import { cancelBooking } from '@/app/actions/bookings';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDateRange, titleCase } from '@/lib/format';

export default async function TripDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/trips/${params.id}`);

  const booking = await getBookingById(params.id);
  if (!booking) notFound();

  const hasReview = (booking.reviews?.length ?? 0) > 0;
  const cancelFailed = searchParams.error === 'cancel_failed';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const boundCancel = cancelBooking.bind(null, booking.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft size={14} />
        My Trips
      </Link>

      <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-400">
        <Building2 size={12} />
        {booking.listings ? titleCase(booking.listings.type) : ''}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-brand-950">{booking.listings?.title ?? 'Booking'}</h1>
      <p className="mt-1 text-sm text-brand-500">{booking.listings?.location}</p>

      {cancelFailed && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          We couldn&apos;t cancel that booking. Please try again or contact support.
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <StatusBadge status={booking.status} />
        <StatusBadge status={booking.payment_status} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-5 rounded-3xl border border-brand-950/5 p-6 text-sm shadow-soft">
        <div>
          <dt className="text-brand-400">Dates</dt>
          <dd className="font-semibold text-brand-900">
            {booking.check_in && booking.check_out
              ? formatDateRange(booking.check_in, booking.check_out)
              : booking.booking_date}
          </dd>
        </div>
        <div>
          <dt className="text-brand-400">Guests</dt>
          <dd className="font-semibold text-brand-900">{booking.guests_count}</dd>
        </div>
        <div>
          <dt className="text-brand-400">Total</dt>
          <dd className="font-semibold text-brand-900">
            {formatCurrency(booking.total_price, booking.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-brand-400">Booking ID</dt>
          <dd className="font-mono text-xs text-brand-500">{booking.id}</dd>
        </div>
      </dl>

      {booking.status === 'pending' && (
        <div className="mt-6 rounded-3xl border border-accent-200 bg-accent-50 p-6 text-sm text-accent-900">
          <p className="font-bold">Complete payment to confirm your booking</p>
          <p className="mt-2">
            Transfer {formatCurrency(booking.total_price, booking.currency)} to DheySa&apos;s bank
            account and share your payment reference with our team. Your booking is held for 15
            minutes and will be confirmed by our team once payment is verified.
          </p>
          <dl className="mt-3 space-y-1 text-xs">
            <div>
              <dt className="inline font-semibold">Bank: </dt>
              <dd className="inline">Bank of Bhutan Ltd.</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Account name: </dt>
              <dd className="inline">DheySa GMC Pvt. Ltd.</dd>
            </div>
            <div>
              <dt className="inline font-semibold">Reference: </dt>
              <dd className="inline font-mono">{booking.id.slice(0, 8)}</dd>
            </div>
          </dl>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50 p-6 text-sm text-brand-800">
          Your booking is confirmed. See you in Gelephu Mindfulness City!
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canCancel && (
          <form action={boundCancel}>
            <button
              type="submit"
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Cancel booking
            </button>
          </form>
        )}
        {booking.status === 'completed' && !hasReview && (
          <Link
            href={`/trips/${booking.id}/review`}
            className="rounded-full bg-accent-500 px-4 py-2 text-sm font-bold text-brand-950 shadow-soft transition hover:bg-accent-400"
          >
            Leave a review
          </Link>
        )}
      </div>
    </main>
  );
}
