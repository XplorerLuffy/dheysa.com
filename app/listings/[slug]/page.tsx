import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/gallery';
import { AvailabilityPreview } from '@/components/availability-preview';
import { StarRating } from '@/components/star-rating';
import { formatCurrency, formatDate, titleCase, todayISO, addDays } from '@/lib/format';
import { getAvailability, getListingBySlug, getReviewsForListing } from '@/lib/data/listings';

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) notFound();

  const from = todayISO();
  const to = addDays(from, 60);
  const [availability, reviews] = await Promise.all([
    getAvailability(listing.id, from, to),
    getReviewsForListing(listing.id),
  ]);

  const amenities = Array.isArray((listing.listing_details?.details as any)?.amenities)
    ? ((listing.listing_details!.details as any).amenities as string[])
    : [];
  const maxGuests = (listing.listing_details?.details as any)?.max_guests as number | undefined;
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
          {titleCase(listing.type)} · {listing.location}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-brand-900">{listing.title}</h1>
        {avgRating && (
          <div className="mt-2 flex items-center gap-2 text-sm text-brand-600">
            <StarRating rating={Math.round(avgRating)} />
            <span>
              {avgRating} ({reviews.length} review{reviews.length === 1 ? '' : 's'})
            </span>
          </div>
        )}
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {listing.hosts?.business_name && (
            <div>
              <h2 className="text-lg font-semibold text-brand-800">
                Hosted by {listing.hosts.business_name}
              </h2>
              {listing.hosts.bio && <p className="mt-2 text-sm text-brand-600">{listing.hosts.bio}</p>}
            </div>
          )}

          {listing.description && (
            <div>
              <h2 className="text-lg font-semibold text-brand-800">About this place</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-brand-600">{listing.description}</p>
            </div>
          )}

          {amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-800">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-brand-600">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-brand-800">Availability</h2>
            <p className="mt-1 text-xs text-brand-400">Next 60 days</p>
            <div className="mt-2">
              <AvailabilityPreview days={availability} />
            </div>
          </div>

          {listing.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.categories.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-brand-800">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-brand-500">No reviews yet.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-brand-100 pb-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-brand-400">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-brand-600">{r.comment}</p>}
                    {r.host_response && (
                      <p className="mt-2 rounded-lg bg-brand-50 p-2 text-xs text-brand-600">
                        <span className="font-medium">Host response: </span>
                        {r.host_response}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-brand-100 p-6 lg:sticky lg:top-6">
          <p className="text-2xl font-semibold text-brand-900">
            {formatCurrency(listing.price_base, listing.currency)}
            <span className="text-sm font-normal text-brand-400"> / night</span>
          </p>
          {maxGuests && <p className="mt-1 text-sm text-brand-500">Sleeps up to {maxGuests} guests</p>}
          <Link
            href={`/listings/${listing.slug}/book`}
            className="mt-4 block w-full rounded-lg bg-brand-600 px-4 py-3 text-center font-semibold text-white hover:bg-brand-700"
          >
            Book now
          </Link>
          <p className="mt-3 text-xs text-brand-400">
            You won&apos;t be charged yet. We hold your dates for 15 minutes while you complete
            payment.
          </p>
        </aside>
      </div>
    </main>
  );
}
