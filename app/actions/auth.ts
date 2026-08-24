'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export type AuthFormState = { error: string | null };

const CONFIG_ERROR = 'Sign-in is temporarily unavailable. Please try again shortly.';

// Shared by guest login, guest sign-up, and (via /host-signup/complete)
// host sign-up. `next` is where /auth/callback should send the browser
// once the OAuth round-trip finishes — for guests that's wherever they
// were headed, for hosts it's the page that collects the business details
// Google doesn't give us.
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = String(formData.get('next') ?? '/');
  let redirectUrl: string | null = null;

  try {
    const supabase = createClient();
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') ?? 'https';
    const origin = host ? `${protocol}://${host}` : '';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    });

    if (!error) redirectUrl = data.url;
  } catch (error) {
    console.error('signInWithGoogle failed:', error);
  }

  redirect(redirectUrl ?? `/login?error=google_unavailable`);
}

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  let signInError: string | null = null;
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    signInError = error?.message ?? null;
  } catch (error) {
    console.error('signIn failed:', error);
    return { error: CONFIG_ERROR };
  }

  if (signInError) {
    return { error: signInError };
  }

  redirect(redirectTo || '/');
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('fullName') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  let signUpError: string | null = null;
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    signUpError = error?.message ?? null;
  } catch (error) {
    console.error('signUp failed:', error);
    return { error: CONFIG_ERROR };
  }

  if (signUpError) {
    return { error: signUpError };
  }

  redirect(redirectTo || '/');
}

export async function signOut() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('signOut failed:', error);
  }
  redirect('/');
}
