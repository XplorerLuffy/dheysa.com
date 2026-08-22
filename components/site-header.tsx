import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import type { CurrentUser } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/hotels', label: 'Hotels' },
  { href: '/homestays', label: 'Homestays' },
];

export function SiteHeader({ user }: { user: CurrentUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-950/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M3 18.5 9 8l3.5 5.5L15 10l6 8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="17" cy="6" r="2" fill="currentColor" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-950">DheySa</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-brand-700 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 transition hover:bg-brand-50 hover:text-brand-900"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/trips"
              className="rounded-full px-3.5 py-2 transition hover:bg-brand-50 hover:text-brand-900"
            >
              My Trips
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="hidden text-brand-500 sm:inline">
                {user.profile?.full_name ?? user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-brand-950/10 px-4 py-2 font-medium text-brand-700 transition hover:border-brand-950/20 hover:bg-brand-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3.5 py-2 font-medium text-brand-700 transition hover:bg-brand-50 hover:text-brand-900"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-800 px-4 py-2 font-semibold text-white shadow-soft transition hover:bg-brand-900"
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
