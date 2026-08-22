import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: Database['public']['Tables']['profiles']['Row'] | null;
};

// Resilient to a Supabase project not being configured yet (dev/preview
// without env vars, or a network hiccup) — guest pages should degrade to
// "logged out" rather than 500.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    return { id: user.id, email: user.email ?? null, profile: profile ?? null };
  } catch {
    return null;
  }
}
