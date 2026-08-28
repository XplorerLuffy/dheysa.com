import Link from 'next/link';
import { ArrowRight, Building2, Users2, CalendarDays } from 'lucide-react';
import { getPendingHosts, getPendingListings, getAllBookings } from '@/lib/data/admin';

export default async function AdminPage() {
  const [pendingHosts, pendingListings, bookings] = await Promise.all([
    getPendingHosts(),
    getPendingListings(),
    getAllBookings(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-950">Dashboard</h1>
      <p className="mt-1 text-sm text-brand-500">Review host applications and listings before they go live.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/hosts"
          className="flex items-center justify-between rounded-2xl border border-brand-950/5 p-5 shadow-soft transition hover:border-brand-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Users2 size={18} />
            </span>
            <div>
              <p className="font-bold text-brand-950">Host applications</p>
              <p className="text-sm text-brand-500">{pendingHosts.length} pending</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-brand-400" />
        </Link>

        <Link
          href="/admin/listings"
          className="flex items-center justify-between rounded-2xl border border-brand-950/5 p-5 shadow-soft transition hover:border-brand-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Building2 size={18} />
            </span>
            <div>
              <p className="font-bold text-brand-950">Listings</p>
              <p className="text-sm text-brand-500">{pendingListings.length} pending review</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-brand-400" />
        </Link>

        <Link
          href="/admin/bookings"
          className="flex items-center justify-between rounded-2xl border border-brand-950/5 p-5 shadow-soft transition hover:border-brand-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CalendarDays size={18} />
            </span>
            <div>
              <p className="font-bold text-brand-950">Bookings</p>
              <p className="text-sm text-brand-500">{bookings.length} recent</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-brand-400" />
        </Link>
      </div>
    </main>
  );
}
