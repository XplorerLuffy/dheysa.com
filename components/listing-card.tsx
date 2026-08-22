import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format';
import { titleCase } from '@/lib/format';
import type { ListingWithHost } from '@/lib/data/listings';

export function ListingCard({ listing }: { listing: ListingWithHost }) {
  const image = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full bg-brand-100">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-400">
            No photo yet
          </div>
        )}
        {listing.curated_by_admin && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700">
            DheySa Curated
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
          {titleCase(listing.type)} · {listing.location}
        </p>
        <h3 className="font-semibold text-brand-800 line-clamp-1">{listing.title}</h3>
        {listing.hosts?.business_name && (
          <p className="text-sm text-brand-500 line-clamp-1">Hosted by {listing.hosts.business_name}</p>
        )}
        <p className="pt-1 text-sm text-brand-700">
          <span className="font-semibold">{formatCurrency(listing.price_base, listing.currency)}</span>{' '}
          <span className="text-brand-400">
            {listing.type === 'hotel' || listing.type === 'homestay' ? '/ night' : ''}
          </span>
        </p>
      </div>
    </Link>
  );
}
