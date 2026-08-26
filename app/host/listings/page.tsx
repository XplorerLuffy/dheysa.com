import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Plus, Pencil, ExternalLink, ArrowRight, Send } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getHostListings } from '@/lib/data/host';
import { resubmitListing } from '@/app/actions/listings';
import { StatusBadge } from '@/components/status-badge';
import { StaggerGroup } from '@/components/motion/stagger-group';
import { formatCurrency, titleCase } from '@/lib/format';

export default async function HostListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/host/listings');
  if (!user.host) redirect('/host-signup');

  const listings = await getHostListings(user.host.id);
  const justUpdated = searchParams.updated === '1';

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-950">My Listings</h1>
        <Link
          href="/host/listings/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          <Plus size={15} /> Add listing
        </Link>
      </div>

      {justUpdated && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          Your listing was updated.
        </p>
      )}

      <Link
        href="/host/bookings"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
      >
        View bookings across all your listings <ArrowRight size={14} />
      </Link>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-semibold text-brand-800">No listings yet.</p>
          <p className="mt-1 text-sm text-brand-500">Add your first property to get started.</p>
          <Link
            href="/host/listings/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            <Plus size={14} /> Add a listing
          </Link>
        </div>
      ) : (
        <StaggerGroup as="ul" className="mt-6 space-y-4" watch={listings.map((l) => l.id).join(',')}>
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-col gap-4 rounded-2xl border border-brand-950/5 p-4 shadow-soft sm:flex-row"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:w-32">
                {listing.images?.[0] && (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                    {titleCase(listing.type)}
                  </p>
                  <p className="font-bold text-brand-950">{listing.title}</p>
                  <p className="text-sm text-brand-500">{listing.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={listing.status} />
                  <span className="text-sm font-bold text-brand-900">
                    {formatCurrency(listing.price_base, listing.currency)}
                    <span className="font-normal text-brand-400"> / night</span>
                  </span>
                </div>
                {listing.status === 'draft' && (
                  <p className="text-xs text-brand-500">
                    Sent back for changes — update it and resubmit when ready.
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-row gap-4 sm:flex-col sm:items-end sm:justify-between">
                <Link
                  href={`/host/listings/${listing.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                >
                  <Pencil size={12} /> Edit
                </Link>
                {listing.status === 'published' && (
                  <Link
                    href={`/listings/${listing.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 hover:underline"
                  >
                    View live <ExternalLink size={11} />
                  </Link>
                )}
                {listing.status === 'draft' && (
                  <form action={resubmitListing.bind(null, listing.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      <Send size={12} /> Resubmit
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </StaggerGroup>
      )}
    </main>
  );
}
