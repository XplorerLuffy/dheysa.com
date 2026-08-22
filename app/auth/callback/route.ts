import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyHostApplication } from '@/app/actions/host';

// Supabase sends users here after confirming their email or a magic link.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

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
