import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type HostListing = Database['public']['Tables']['listings']['Row'];

// RLS scopes these to the signed-in host's own listings/bookings — the
// hostId parameter is still required so callers can't accidentally pass
// no filter at all.
export async function getHostListings(hostId: string): Promise<HostListing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export type HostListingDetail = HostListing & {
  listing_details: { details: Record<string, unknown> } | null;
};

export async function getHostListingById(hostId: string, id: string): Promise<HostListingDetail | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_details(details)')
      .eq('id', id)
      .eq('host_id', hostId)
      .maybeSingle();
    if (error) throw error;
    return data as HostListingDetail | null;
  } catch {
    return null;
  }
}

export type HostBooking = Database['public']['Tables']['bookings']['Row'] & {
  listings: { title: string; slug: string } | null;
  profiles: { full_name: string | null } | null;
};

export async function getHostBookings(hostId: string): Promise<HostBooking[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(title, slug), profiles(full_name)')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as HostBooking[];
  } catch {
    return [];
  }
}
