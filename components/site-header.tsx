import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import type { CurrentUser } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/hotels', label: 'Hotels' },
  { href: '/homestays', label: 'Homestays' },
];

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className="border-b border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-brand-800">
          DheySa
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-700 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-900">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/trips" className="hover:text-brand-900">
              My Trips
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-brand-500 sm:inline">
                {user.profile?.full_name ?? user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-brand-200 px-4 py-1.5 font-medium text-brand-700 hover:bg-brand-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-brand-700 hover:text-brand-900">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-600 px-4 py-1.5 font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
