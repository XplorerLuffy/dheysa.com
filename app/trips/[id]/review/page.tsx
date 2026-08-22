import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getBookingById } from '@/lib/data/bookings';
import { ReviewForm } from '@/components/review-form';

export default async function LeaveReviewPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/trips/${params.id}/review`);

  const booking = await getBookingById(params.id);
  if (!booking) notFound();

  if (booking.status !== 'completed') {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-medium text-brand-700">Reviews open up after your stay is complete.</p>
      </main>
    );
  }

  if ((booking.reviews?.length ?? 0) > 0) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="font-medium text-brand-700">You&apos;ve already reviewed this trip. Thank you!</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">Review your stay</h1>
      <p className="mt-1 text-sm text-brand-500">{booking.listings?.title}</p>
      <div className="mt-6">
        <ReviewForm bookingId={booking.id} />
      </div>
    </main>
  );
}
