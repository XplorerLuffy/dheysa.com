import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Check, ShieldCheck, Users } from 'lucide-react';
import { Gallery } from '@/components/gallery';
import { AvailabilityPreview } from '@/components/availability-preview';
import { StarRating } from '@/components/star-rating';
import { ScoreBadge } from '@/components/score-badge';
import { Reveal } from '@/components/motion/reveal';
import { StaggerGroup } from '@/components/motion/stagger-group';
import { formatCurrency, formatDate, titleCase, todayISO, addDays } from '@/lib/format';
import { getAvailability, getListingBySlug, getReviewsForListing } from '@/lib/data/listings';

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const from = todayISO();
  const to = addDays(from, 60);
  const roomTypes = listing.room_types ?? [];
  const hasRoomTypes = roomTypes.length > 0;

  const [availability, reviews] = await Promise.all([
    hasRoomTypes ? Promise.resolve([]) : getAvailability(listing.id, from, to),
    getReviewsForListing(listing.id),
  ]);

  const amenities = Array.isArray((listing.listing_details?.details as any)?.amenities)
    ? ((listing.listing_details!.details as any).amenities as string[])
    : [];
  const maxGuests = (listing.listing_details?.details as any)?.max_guests as number | undefined;
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;
  const cheapestRoom = hasRoomTypes
    ? roomTypes.reduce((min, rt) => (rt.price < min.price ? rt : min), roomTypes[0])
    : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Reveal className="mb-4" y={12}>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
          {titleCase(listing.type)}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-brand-950">{listing.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-600">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {listing.location}
          </span>
          {avgRating && <ScoreBadge avgRating={avgRating} reviewCount={reviews.length} />}
          {listing.curated_by_admin && (
            <span className="flex items-center gap-1 font-medium text-brand-700">
              <ShieldCheck size={14} className="text-accent-500" />
              DheySa Curated
            </span>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Gallery images={listing.images} title={listing.title} />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <StaggerGroup className="space-y-9 lg:col-span-2">
          {listing.hosts?.business_name && (
            <div>
              <h2 className="text-lg font-bold text-brand-950">
                Hosted by {listing.hosts.business_name}
              </h2>
              {listing.hosts.bio && <p className="mt-2 text-sm leading-relaxed text-brand-600">{listing.hosts.bio}</p>}
            </div>
          )}

          {listing.description && (
            <div>
              <h2 className="text-lg font-bold text-brand-950">About this place</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-600">
                {listing.description}
              </p>
            </div>
          )}

          {hasRoomTypes && (
            <div id="room-types">
              <h2 className="text-lg font-bold text-brand-950">Choose your room</h2>
              <p className="mt-1 text-sm text-brand-500">
                Each room type has its own price and availability.
              </p>
              <div className="mt-3 space-y-3">
                {roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    className="flex flex-col gap-3 rounded-2xl border border-brand-950/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-brand-950">{rt.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-brand-500">
                        <Users size={12} />
                        Sleeps up to {rt.max_guests} · {rt.room_count} room
                        {rt.room_count === 1 ? '' : 's'} of this type
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                      <p className="font-bold text-brand-900">
                        {formatCurrency(rt.price, listing.currency)}
                        <span className="text-xs font-normal text-brand-400"> / night</span>
                      </p>
                      <Link
                        href={`/listings/${listing.slug}/book?roomType=${rt.id}`}
                        className="rounded-full bg-accent-500 px-4 py-2 text-sm font-bold text-brand-950 shadow-soft transition hover:bg-accent-400"
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-brand-950">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-brand-600">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <Check size={14} className="shrink-0 text-brand-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasRoomTypes && (
            <div>
              <h2 className="text-lg font-bold text-brand-950">Availability</h2>
              <p className="mt-1 text-xs text-brand-400">Next 60 days</p>
              <div className="mt-3">
                <AvailabilityPreview days={availability} />
              </div>
            </div>
          )}

          {listing.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.categories.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-brand-950">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-brand-500">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-5">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-brand-100 pb-5">
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-brand-400">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-brand-600">{r.comment}</p>}
                    {r.host_response && (
                      <p className="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-600">
                        <span className="font-semibold">Host response: </span>
                        {r.host_response}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </StaggerGroup>

        <Reveal delay={0.15}>
          <aside className="h-fit rounded-3xl border border-brand-950/5 p-6 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-3">
              <p className="text-2xl font-bold text-brand-950">
                {hasRoomTypes && (
                  <span className="text-sm font-normal text-brand-400">from </span>
                )}
                {formatCurrency(hasRoomTypes ? cheapestRoom!.price : listing.price_base, listing.currency)}
                <span className="text-sm font-normal text-brand-400"> / night</span>
              </p>
              {avgRating && <ScoreBadge avgRating={avgRating} reviewCount={reviews.length} />}
            </div>
            {!hasRoomTypes && maxGuests && (
              <p className="mt-1 text-sm text-brand-500">Sleeps up to {maxGuests} guests</p>
            )}
            <Link
              href={hasRoomTypes ? '#room-types' : `/listings/${listing.slug}/book`}
              className="mt-5 block w-full rounded-2xl bg-accent-500 px-4 py-3.5 text-center font-bold text-brand-950 shadow-soft transition hover:bg-accent-400"
            >
              {hasRoomTypes ? 'Choose a room' : 'Book now'}
            </Link>
            <p className="mt-3 text-center text-xs text-brand-400">
              You won&apos;t be charged yet. We hold your dates for 15 minutes while you complete
              payment.
            </p>
          </aside>
        </Reveal>
      </div>
    </main>
  );
}
