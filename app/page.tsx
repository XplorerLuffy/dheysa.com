import Link from 'next/link';
import { ShieldCheck, Sparkles, Users2, ArrowRight } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { ListingCard } from '@/components/listing-card';
import { getCuratedCollections, getFeaturedListings } from '@/lib/data/listings';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Personally vetted',
    body: 'Every listing is reviewed by our team before it goes live — no self-serve clutter.',
  },
  {
    icon: Sparkles,
    title: 'Curated, not crowded',
    body: 'A focused selection across GMC, handpicked for quality over quantity.',
  },
  {
    icon: Users2,
    title: 'Local hosts',
    body: 'Book directly with verified hotels, homestays, and guides based in Gelephu.',
  },
];

export default async function HomePage() {
  const [featured, collections] = await Promise.all([getFeaturedListings(), getCuratedCollections()]);

  return (
    <main>
      <section className="relative overflow-hidden bg-brand-950 pb-28 pt-16 sm:pb-32 sm:pt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath d='M0 90 L30 40 L50 65 L75 25 L120 90' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E\")",
            backgroundSize: '240px 240px',
          }}
        />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-100">
            <Sparkles size={13} className="text-accent-400" />
            Gelephu Mindfulness City, Bhutan
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Curated stays &amp; experiences, hand-picked for GMC
          </h1>
          <p className="max-w-xl text-brand-200">
            Every hotel, homestay, tour, and ride on DheySa is personally vetted — not a
            self-serve listing. Book with confidence.
          </p>
        </div>

        <div className="relative mx-auto mt-10 flex max-w-6xl justify-center px-6">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto -mt-2 max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex items-start gap-3 rounded-2xl p-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <point.icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-brand-950">{point.title}</p>
                <p className="mt-0.5 text-sm text-brand-500">{point.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <SectionHeader title="Featured stays" />
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
          <SectionHeader title={collection.name} subtitle={collection.description} />
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

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-brand-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-brand-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
      <p className="font-semibold text-brand-800">New listings are being curated right now.</p>
      <p className="mt-1 text-sm text-brand-500">Check back soon, or browse what's open today.</p>
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
  );
}
