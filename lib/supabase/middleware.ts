import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_LOGIN_PATH = '/admin/login';

// The dashboard itself (app/admin/(dashboard)/layout.tsx) re-checks this
// too — this is the first line of defense so a non-admin never even
// receives the page's HTML, and the login page must stay excluded or an
// unauthenticated /admin visit would redirect-loop against itself.
function isAdminGuarded(pathname: string) {
  if (pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

// Refreshes the Supabase auth session on every request so server
// components always see a valid (or correctly expired) session, and gates
// /admin/* on a signed-in admin account.
//
// This runs on almost every request (see the matcher in middleware.ts), so
// it must never throw: a missing/misconfigured Supabase project, a DNS
// blip, or a timeout here would otherwise take down every single page
// with a 500, not just auth-dependent ones.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Skipping Supabase session refresh: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.'
      );
    }
    return response;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Touching auth.getUser() is what actually refreshes the session.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    if (isAdminGuarded(pathname)) {
      if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = ADMIN_LOGIN_PATH;
        loginUrl.search = '';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
      }
    }
  } catch (error) {
    console.error('Supabase session refresh failed:', error);
  }

  return response;
}
