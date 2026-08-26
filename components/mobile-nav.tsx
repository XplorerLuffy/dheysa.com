'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import type { CurrentUser } from '@/lib/auth';

// The header's main nav (Hotels/Homestays/My Trips/My listings/List your
// property) is hidden below the `sm` breakpoint with nothing replacing it —
// on mobile those links were simply unreachable. This is that replacement:
// a small dropdown panel toggled from a hamburger button, sm:hidden itself
// so it only shows where the real nav is hidden.
export function MobileNav({ user }: { user: CurrentUser | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-50"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-brand-950/5 bg-white px-6 py-4 shadow-lift">
          <nav className="flex flex-col gap-1 text-sm font-medium text-brand-700">
            <Link href="/hotels" onClick={close} className="rounded-xl px-3 py-2.5 hover:bg-brand-50">
              Hotels
            </Link>
            <Link href="/homestays" onClick={close} className="rounded-xl px-3 py-2.5 hover:bg-brand-50">
              Homestays
            </Link>
            {user && (
              <Link href="/trips" onClick={close} className="rounded-xl px-3 py-2.5 hover:bg-brand-50">
                My Trips
              </Link>
            )}
            {user?.host && (
              <Link
                href="/host/listings"
                onClick={close}
                className="rounded-xl px-3 py-2.5 hover:bg-brand-50"
              >
                My listings
              </Link>
            )}
            {!user?.host && (
              <Link
                href="/list-your-property"
                onClick={close}
                className="rounded-xl px-3 py-2.5 font-semibold hover:bg-brand-50"
              >
                List your property
              </Link>
            )}
            {user?.profile?.role === 'admin' && (
              <Link href="/admin" onClick={close} className="rounded-xl px-3 py-2.5 hover:bg-brand-50">
                Admin
              </Link>
            )}
          </nav>

          {user && (
            <div className="mt-3 border-t border-brand-950/5 pt-3">
              <p className="px-3 text-xs text-brand-400">{user.profile?.full_name ?? user.email}</p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl border border-brand-950/10 px-3 py-2.5 text-left text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
