import { ListingCard } from '@/components/listing-card';
import { ListingFilters } from '@/components/listing-filters';
import { getListingsByType } from '@/lib/data/listings';
import type { ListingType } from '@/types/database.types';

const TITLES: Record<ListingType, string> = {
  hotel: 'Hotels',
  homestay: 'Homestays',
  tour: 'Tours & Experiences',
  transport: 'Transport',
};

export async function ListingBrowsePage({
  type,
  searchParams,
}: {
  type: ListingType;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const location = typeof searchParams.location === 'string' ? searchParams.location : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined;
  const checkIn = typeof searchParams.checkin === 'string' ? searchParams.checkin : undefined;
  const checkOut = typeof searchParams.checkout === 'string' ? searchParams.checkout : undefined;

  const listings = await getListingsByType(type, {
    location,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    checkIn,
    checkOut,
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">{TITLES[type]} in GMC</h1>

      <div className="mb-8">
        <ListingFilters />
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-medium text-brand-700">No {TITLES[type].toLowerCase()} match your search yet.</p>
          <p className="mt-1 text-sm text-brand-500">Try clearing a filter or checking different dates.</p>
        </div>
      )}
    </main>
  );
}
