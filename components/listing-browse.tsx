import { Building2, Home, Compass, Car } from 'lucide-react';
import { ListingListItem } from '@/components/listing-list-item';
import { SearchFieldsBar } from '@/components/search-fields-bar';
import { ResultsSidebar } from '@/components/results-sidebar';
import { TypeTabRow, type TypeTabItem } from '@/components/type-tab-row';
import { StaggerGroup } from '@/components/motion/stagger-group';
import { getListingsByType, getRatingsForListings, type SortOption } from '@/lib/data/listings';
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
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as SortOption) : undefined;

  const listings = await getListingsByType(type, {
    location,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    checkIn,
    checkOut,
    sort,
  });

  const ratings = await getRatingsForListings(listings.map((l) => l.id));

  const carryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') carryParams.set(key, value);
  }
  const qs = carryParams.toString();

  const tabs: TypeTabItem[] = [
    { label: 'Hotels', icon: Building2, active: type === 'hotel', href: `/hotels${qs ? `?${qs}` : ''}` },
    {
      label: 'Homestays',
      icon: Home,
      active: type === 'homestay',
      href: `/homestays${qs ? `?${qs}` : ''}`,
    },
    { label: 'Tours', icon: Compass, disabled: true },
    { label: 'Transport', icon: Car, disabled: true },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-5">
        <TypeTabRow items={tabs} />
      </div>

      <div className="sticky top-[73px] z-30 -mx-6 bg-white/90 px-6 py-3 backdrop-blur-md">
        <SearchFieldsBar />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <ResultsSidebar />

        <div>
          <div className="mb-5">
            <h1 className="text-xl font-bold text-brand-950">{TITLES[type]} in GMC</h1>
            <p className="mt-1 text-sm text-brand-500">
              {listings.length > 0
                ? `${listings.length} curated ${listings.length === 1 ? 'listing' : 'listings'}`
                : "Browse what's open in Gelephu Mindfulness City"}
            </p>
          </div>

          {listings.length > 0 ? (
            <StaggerGroup className="space-y-4" watch={listings.map((l) => l.id).join(',')}>
              {listings.map((listing) => (
                <ListingListItem key={listing.id} listing={listing} rating={ratings.get(listing.id)} />
              ))}
            </StaggerGroup>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
              <p className="font-semibold text-brand-800">
                No {TITLES[type].toLowerCase()} match your search yet.
              </p>
              <p className="mt-1 text-sm text-brand-500">Try clearing a filter or checking different dates.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
