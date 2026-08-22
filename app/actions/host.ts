'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type HostSignupState = { error: string | null };

const CONFIG_ERROR = 'Sign-up is temporarily unavailable. Please try again shortly.';

// Applies the details collected during host sign-up once the account is
// actually authenticated — either right after signUp() if email
// confirmation is off, or from the /auth/callback route once the user
// confirms their email and a session exists.
export async function applyHostApplication(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  { phone, businessName }: { phone: string; businessName: string }
) {
  if (phone) {
    await supabase.from('profiles').update({ phone }).eq('id', userId);
  }
  if (businessName) {
    await supabase
      .from('hosts')
      .upsert({ user_id: userId, business_name: businessName }, { onConflict: 'user_id', ignoreDuplicates: true });
  }
}

export async function signUpHost(_prevState: HostSignupState, formData: FormData): Promise<HostSignupState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const businessName = String(formData.get('businessName') ?? '').trim();

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (!businessName) {
    return { error: 'Tell us the name of your property or business.' };
  }

  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          business_name: businessName,
          host_application: true,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session && data.user) {
      await applyHostApplication(supabase, data.user.id, { phone, businessName });
    }
  } catch (error) {
    console.error('signUpHost failed:', error);
    return { error: CONFIG_ERROR };
  }

  redirect(`/host-signup/thanks?email=${encodeURIComponent(email)}`);
}
