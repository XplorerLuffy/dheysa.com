import Link from 'next/link';
import { LayoutDashboard, Users2, Building2, CalendarDays, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/hosts', label: 'Host applications', icon: Users2 },
  { href: '/admin/listings', label: 'Listings', icon: Building2 },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
];

export function AdminSidebar({ name }: { name: string }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-8 border-r border-brand-950/5 bg-white px-4 py-6">
      <div>
        <p className="text-lg font-bold tracking-tight text-brand-950">DheySa</p>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Admin</p>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-0.5">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 hover:text-brand-900"
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-2 border-t border-brand-950/5 pt-4">
        <p className="truncate px-3 text-xs text-brand-400">Signed in as {name}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
