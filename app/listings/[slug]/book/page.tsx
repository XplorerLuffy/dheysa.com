import { notFound, redirect } from 'next/navigation';
import { getAvailability, getListingBySlug, getRoomTypeAvailability } from '@/lib/data/listings';
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

  const roomTypes = listing.room_types ?? [];
  const roomTypeId = typeof searchParams.roomType === 'string' ? searchParams.roomType : undefined;
  const roomType = roomTypeId ? roomTypes.find((rt) => rt.id === roomTypeId) : undefined;

  // Hotels book a specific room type — if the link didn't carry one (or
  // carried one that doesn't belong to this listing), send the guest back
  // to pick one rather than falling back to some default.
  if (roomTypes.length > 0 && !roomType) {
    redirect(`/listings/${listing.slug}#room-types`);
  }

  const from = todayISO();
  const to = addDays(from, 60);
  const availability = roomType
    ? await getRoomTypeAvailability(roomType.id, from, to)
    : await getAvailability(listing.id, from, to);

  const maxGuests = roomType
    ? roomType.max_guests
    : ((listing.listing_details?.details as any)?.max_guests as number | undefined);
  const priceBase = roomType ? roomType.price : listing.price_base;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-950">{listing.title}</h1>
      <p className="mt-1 text-sm text-brand-500">{listing.location}</p>
      {roomType && <p className="mt-1 text-sm font-semibold text-brand-700">{roomType.name}</p>}

      <div className="mt-6">
        <BookingForm
          listingId={listing.id}
          listingSlug={listing.slug}
          roomTypeId={roomType?.id}
          priceBase={priceBase}
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
