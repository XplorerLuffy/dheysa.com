import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getPendingHosts } from '@/lib/data/admin';
import { approveHost, rejectHost } from '@/app/actions/admin';
import { formatDate } from '@/lib/format';

export default async function AdminHostsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin/hosts');
  if (user.profile?.role !== 'admin') redirect('/');

  const pendingHosts = await getPendingHosts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-800"
      >
        <ArrowLeft size={14} />
        Admin
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-brand-950">Host applications</h1>

      {pendingHosts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-16 text-center">
          <p className="font-semibold text-brand-800">No pending applications.</p>
          <p className="mt-1 text-sm text-brand-500">New host sign-ups will show up here.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {pendingHosts.map((host) => (
            <li key={host.id} className="rounded-2xl border border-brand-950/5 p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-950">{host.business_name}</p>
                  <p className="text-sm text-brand-500">{host.profiles?.full_name ?? 'Unknown applicant'}</p>
                  {host.profiles?.phone && <p className="text-sm text-brand-500">{host.profiles.phone}</p>}
                  {host.contact_phone && (
                    <p className="text-sm text-brand-500">Business phone: {host.contact_phone}</p>
                  )}
                  {host.bio && <p className="mt-2 text-sm text-brand-600">{host.bio}</p>}
                  <p className="mt-2 text-xs text-brand-400">Applied {formatDate(host.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <form action={approveHost.bind(null, host.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
                    >
                      <Check size={14} /> Approve
                    </button>
                  </form>
                  <form action={rejectHost.bind(null, host.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
