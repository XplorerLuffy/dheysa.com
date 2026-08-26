import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

// Every query here relies on the "_or_admin" clause already present on
// each table's SELECT policy (hosts, listings) — RLS returns nothing for
// a non-admin caller rather than erroring, so these are safe to call from
// any page as long as the page itself also gates on profile.role, which
// every /admin page does.

export type PendingHost = Database['public']['Tables']['hosts']['Row'] & {
  profiles: { full_name: string | null; phone: string | null } | null;
};

export async function getPendingHosts(): Promise<PendingHost[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hosts')
      .select('*, profiles(full_name, phone)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as PendingHost[];
  } catch {
    return [];
  }
}

export type PendingListing = Database['public']['Tables']['listings']['Row'] & {
  hosts: { business_name: string } | null;
};

export async function getPendingListings(): Promise<PendingListing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*, hosts(business_name)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as PendingListing[];
  } catch {
    return [];
  }
}
