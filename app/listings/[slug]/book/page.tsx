import { notFound, redirect } from 'next/navigation';
import { getAvailability, getListingBySlug } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/auth';
import { BookingForm } from '@/components/booking-form';
import { todayISO, addDays } from '@/lib/format';

export default async function BookListingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=/listings/${params.slug}/book`);
  }

  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const from = todayISO();
  const to = addDays(from, 60);
  const availability = await getAvailability(listing.id, from, to);

  const maxGuests = (listing.listing_details?.details as any)?.max_guests as number | undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-950">{listing.title}</h1>
      <p className="mt-1 text-sm text-brand-500">{listing.location}</p>

      <div className="mt-6">
        <BookingForm
          listingId={listing.id}
          listingSlug={listing.slug}
          priceBase={listing.price_base}
          currency={listing.currency}
          maxGuests={maxGuests}
          availability={availability}
          initialCheckIn={typeof searchParams.checkin === 'string' ? searchParams.checkin : undefined}
          initialCheckOut={typeof searchParams.checkout === 'string' ? searchParams.checkout : undefined}
          initialGuests={
            typeof searchParams.guests === 'string' ? Number(searchParams.guests) : undefined
          }
        />
      </div>
    </main>
  );
}
