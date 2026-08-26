import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getPendingListings } from '@/lib/data/admin';
import { approveListing, rejectListing } from '@/app/actions/admin';
import { formatCurrency, titleCase } from '@/lib/format';

export default async function AdminListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin/listings');
  if (user.profile?.role !== 'admin') redirect('/');

  const pendingListings = await getPendingListings();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft size={14} />
        Admin
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-950">Listings pending review</h1>

      {pendingListings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-semibold text-brand-800">Nothing pending.</p>
          <p className="mt-1 text-sm text-brand-500">New and resubmitted listings will show up here.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {pendingListings.map((listing) => (
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
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                  {titleCase(listing.type)}
                </p>
                <p className="font-bold text-brand-950">{listing.title}</p>
                <p className="text-sm text-brand-500">{listing.location}</p>
                <p className="text-sm text-brand-500">Hosted by {listing.hosts?.business_name ?? 'Unknown'}</p>
                <p className="mt-1 text-sm font-bold text-brand-900">
                  {formatCurrency(listing.price_base, listing.currency)}
                  <span className="font-normal text-brand-400"> / night</span>
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <form action={approveListing.bind(null, listing.id)} className="flex flex-col items-start gap-1.5 sm:items-end">
                  <label className="flex items-center gap-1.5 text-xs text-brand-600">
                    <input
                      type="checkbox"
                      name="curatedByAdmin"
                      value="true"
                      className="h-3.5 w-3.5 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
                    />
                    DheySa Curated
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-brand-600">
                    <input
                      type="checkbox"
                      name="featured"
                      value="true"
                      className="h-3.5 w-3.5 rounded border-brand-950/20 text-brand-700 focus:ring-brand-300"
                    />
                    Featured
                  </label>
                  <button
                    type="submit"
                    className="mt-1 rounded-full bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
                  >
                    Approve &amp; publish
                  </button>
                </form>
                <form action={rejectListing.bind(null, listing.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <X size={14} /> Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
