import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
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
      <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
        {booking.listings ? titleCase(booking.listings.type) : ''}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-900">
        {booking.listings?.title ?? 'Booking'}
      </h1>
      <p className="mt-1 text-sm text-brand-500">{booking.listings?.location}</p>

      {cancelFailed && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          We couldn&apos;t cancel that booking. Please try again or contact support.
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <StatusBadge status={booking.status} />
        <StatusBadge status={booking.payment_status} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-brand-100 p-6 text-sm">
        <div>
          <dt className="text-brand-400">Dates</dt>
          <dd className="font-medium text-brand-800">
            {booking.check_in && booking.check_out
              ? formatDateRange(booking.check_in, booking.check_out)
              : booking.booking_date}
          </dd>
        </div>
        <div>
          <dt className="text-brand-400">Guests</dt>
          <dd className="font-medium text-brand-800">{booking.guests_count}</dd>
        </div>
        <div>
          <dt className="text-brand-400">Total</dt>
          <dd className="font-medium text-brand-800">
            {formatCurrency(booking.total_price, booking.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-brand-400">Booking ID</dt>
          <dd className="font-mono text-xs text-brand-500">{booking.id}</dd>
        </div>
      </dl>

      {booking.status === 'pending' && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Complete payment to confirm your booking</p>
          <p className="mt-2">
            Transfer {formatCurrency(booking.total_price, booking.currency)} to DheySa&apos;s bank
            account and share your payment reference with our team. Your booking is held for 15
            minutes and will be confirmed by our team once payment is verified.
          </p>
          <dl className="mt-3 space-y-1 text-xs">
            <div>
              <dt className="inline font-medium">Bank: </dt>
              <dd className="inline">Bank of Bhutan Ltd.</dd>
            </div>
            <div>
              <dt className="inline font-medium">Account name: </dt>
              <dd className="inline">DheySa GMC Pvt. Ltd.</dd>
            </div>
            <div>
              <dt className="inline font-medium">Reference: </dt>
              <dd className="inline font-mono">{booking.id.slice(0, 8)}</dd>
            </div>
          </dl>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          Your booking is confirmed. See you in Gelephu Mindfulness City!
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        {canCancel && (
          <form action={boundCancel}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancel booking
            </button>
          </form>
        )}
        {booking.status === 'completed' && !hasReview && (
          <Link
            href={`/trips/${booking.id}/review`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Leave a review
          </Link>
        )}
        <Link href="/trips" className="text-sm font-medium text-brand-600 underline">
          Back to My Trips
        </Link>
      </div>
    </main>
  );
}
