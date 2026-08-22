import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, MapPin } from 'lucide-react';
import { formatCurrency, titleCase } from '@/lib/format';
import type { ListingWithHost } from '@/lib/data/listings';

export function ListingCard({ listing }: { listing: ListingWithHost }) {
  const image = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block overflow-hidden rounded-2xl border border-brand-950/5 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-400">
            No photo yet
          </div>
        )}
        {listing.curated_by_admin && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm">
            <Sparkles size={12} className="text-accent-500" />
            DheySa Curated
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
          {titleCase(listing.type)}
        </p>
        <h3 className="font-bold text-brand-950 line-clamp-1">{listing.title}</h3>
        <p className="flex items-center gap-1 text-sm text-brand-500">
          <MapPin size={13} className="shrink-0" />
          <span className="line-clamp-1">{listing.location}</span>
        </p>
        {listing.hosts?.business_name && (
          <p className="text-xs text-brand-400 line-clamp-1">Hosted by {listing.hosts.business_name}</p>
        )}
        <p className="pt-1.5 text-sm text-brand-800">
          <span className="text-base font-bold">{formatCurrency(listing.price_base, listing.currency)}</span>{' '}
          <span className="text-brand-400">
            {listing.type === 'hotel' || listing.type === 'homestay' ? '/ night' : ''}
          </span>
        </p>
      </div>
    </Link>
  );
}
