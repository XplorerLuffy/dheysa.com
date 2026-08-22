import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the Supabase auth session on every request so server
// components always see a valid (or correctly expired) session.
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
    await supabase.auth.getUser();
  } catch (error) {
    console.error('Supabase session refresh failed:', error);
  }

  return response;
}
