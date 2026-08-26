import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { applyHostApplication } from '@/app/actions/host';

// Supabase sends users here after confirming their email, a magic link, or
// an OAuth sign-in (Google). Deliberately reads the Host header instead of
// new URL(request.url).origin — behind Hostinger's reverse proxy the latter
// resolves to the app's internal bind address (http://localhost:3000)
// rather than the public domain, sending every one of these flows to a
// localhost URL the browser can't reach. headers() reads the forwarded
// Host header directly, same as the working pattern in signInWithGoogle
// and signUpHost.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') ?? 'https';
  const origin = host ? `${protocol}://${host}` : new URL(request.url).origin;

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Host sign-up stashes the application details in user metadata since
    // there's no session yet at signUp() time when email confirmation is
    // required — finish it now that the user is actually authenticated.
    const meta = data.user?.user_metadata;
    if (data.user && meta?.host_application) {
      await applyHostApplication(supabase, data.user.id, {
        phone: typeof meta.phone === 'string' ? meta.phone : '',
        businessName: typeof meta.business_name === 'string' ? meta.business_name : '',
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
