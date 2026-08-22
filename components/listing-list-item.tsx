import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, MapPin } from 'lucide-react';
import { formatCurrency, titleCase } from '@/lib/format';
import { ScoreBadge } from '@/components/score-badge';
import type { ListingWithHost, ListingRating } from '@/lib/data/listings';

export function ListingListItem({
  listing,
  rating,
}: {
  listing: ListingWithHost;
  rating?: ListingRating;
}) {
  const image = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-brand-950/5 bg-white shadow-soft transition hover:shadow-lift"
    >
      <div className="relative w-32 shrink-0 overflow-hidden bg-brand-100 sm:w-56">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(min-width: 640px) 224px, 128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-brand-400">No photo</div>
        )}
        {listing.curated_by_admin && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-brand-800 shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
            <Sparkles size={11} className="text-accent-500" />
            <span className="hidden sm:inline">DheySa Curated</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
            {titleCase(listing.type)}
          </p>
          <h3 className="mt-0.5 font-bold text-brand-950 sm:text-lg">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-brand-500">
            <MapPin size={13} className="shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </p>
          {listing.hosts?.business_name && (
            <p className="mt-0.5 text-xs text-brand-400 line-clamp-1">
              Hosted by {listing.hosts.business_name}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          {rating ? (
            <ScoreBadge avgRating={rating.avg} reviewCount={rating.count} />
          ) : (
            <span className="text-xs text-brand-400">No reviews yet</span>
          )}
          <div className="text-right">
            <p className="text-[11px] text-brand-400">Starting from</p>
            <p className="text-lg font-bold text-brand-950 sm:text-xl">
              {formatCurrency(listing.price_base, listing.currency)}
            </p>
            <p className="text-[11px] text-brand-400">
              {listing.type === 'hotel' || listing.type === 'homestay' ? 'per night' : ''}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
