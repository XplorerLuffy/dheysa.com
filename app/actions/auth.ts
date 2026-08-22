'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthFormState = { error: string | null };

const CONFIG_ERROR = 'Sign-in is temporarily unavailable. Please try again shortly.';

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
