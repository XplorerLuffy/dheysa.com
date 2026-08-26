import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getHostListingById } from '@/lib/data/host';
import { NewListingWizard, type NewListingWizardInitial } from '@/components/new-listing-wizard';
import { Reveal } from '@/components/motion/reveal';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/host/listings/${params.id}/edit`);
  if (!user.host) redirect('/host-signup');

  const listing = await getHostListingById(user.host.id, params.id);
  if (!listing) notFound();

  const details = (listing.listing_details?.details ?? {}) as Record<string, unknown>;
  const houseRules = (details.house_rules ?? {}) as Record<string, unknown>;
  const checkIn = (houseRules.check_in ?? {}) as Record<string, unknown>;
  const checkOut = (houseRules.check_out ?? {}) as Record<string, unknown>;
  const roomTypes = (listing.room_types ?? []).map((rt) => ({
    id: rt.id,
    name: rt.name,
    price: String(rt.price),
    maxGuests: String(rt.max_guests),
    count: String(rt.room_count),
  }));

  const initial: NewListingWizardInitial = {
    type: listing.type === 'hotel' || listing.type === 'homestay' ? listing.type : '',
    title: listing.title,
    location: listing.location,
    description: listing.description ?? '',
    images: listing.images ?? [],
    priceBase: String(listing.price_base),
    maxGuests: details.max_guests != null ? String(details.max_guests) : '2',
    bedrooms: details.bedrooms != null ? String(details.bedrooms) : '1',
    bathrooms: details.bathrooms != null ? String(details.bathrooms) : '1',
    roomCount: details.room_count != null ? String(details.room_count) : '1',
    roomTypes,
    sizeSqm: details.size_sqm != null ? String(details.size_sqm) : '',
    amenities: Array.isArray(details.amenities) ? (details.amenities as string[]) : [],
    languages: Array.isArray(details.languages_spoken) ? (details.languages_spoken as string[]) : ['English'],
    smokingAllowed: Boolean(houseRules.smoking_allowed),
    partiesAllowed: Boolean(houseRules.parties_allowed),
    childrenAllowed: houseRules.children_allowed !== false,
    petsAllowed:
      houseRules.pets_allowed === 'yes' || houseRules.pets_allowed === 'upon_request'
        ? houseRules.pets_allowed
        : 'no',
    checkInFrom: String(checkIn.from ?? '14:00'),
    checkInUntil: String(checkIn.until ?? '20:00'),
    checkOutFrom: String(checkOut.from ?? '06:00'),
    checkOutUntil: String(checkOut.until ?? '11:00'),
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Link
        href="/host/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft size={14} />
        My listings
      </Link>
      <Reveal className="mt-5 w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <NewListingWizard listingId={listing.id} initial={initial} />
        </div>
      </Reveal>
    </main>
  );
}
