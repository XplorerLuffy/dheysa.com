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

export type AdminBooking = Database['public']['Tables']['bookings']['Row'] & {
  listings: { title: string; slug: string } | null;
  room_types: { name: string } | null;
  hosts: { business_name: string } | null;
  profiles: { full_name: string | null } | null;
};

// No host_id filter — the bookings_select_guest_or_host_or_admin RLS
// policy already returns every booking for an is_admin() caller, so this
// spans all hosts (unlike lib/data/host.ts's getHostBookings).
export async function getAllBookings(): Promise<AdminBooking[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(title, slug), room_types(name), hosts(business_name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as unknown as AdminBooking[];
  } catch {
    return [];
  }
}
