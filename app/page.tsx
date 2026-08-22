import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';
import { ListingCard } from '@/components/listing-card';
import { getCuratedCollections, getFeaturedListings } from '@/lib/data/listings';

export default async function HomePage() {
  const [featured, collections] = await Promise.all([getFeaturedListings(), getCuratedCollections()]);

  return (
    <main>
      <section className="bg-brand-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-brand-900 sm:text-4xl">
              Curated stays &amp; experiences in Gelephu Mindfulness City
            </h1>
            <p className="mx-auto max-w-xl text-brand-600">
              Every hotel, homestay, tour, and ride on DheySa is personally vetted — not a
              self-serve listing. Book with confidence.
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-800">Featured stays</h2>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {collections.map((collection) => (
        <section key={collection.id} className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-brand-800">{collection.name}</h2>
            {collection.description && (
              <p className="mt-1 text-sm text-brand-500">{collection.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collection.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
      <p className="font-medium text-brand-700">New listings are being curated right now.</p>
      <p className="mt-1 text-sm text-brand-500">
        Check back soon, or browse{' '}
        <Link href="/hotels" className="underline">
          hotels
        </Link>{' '}
        and{' '}
        <Link href="/homestays" className="underline">
          homestays
        </Link>
        .
      </p>
    </div>
  );
}
