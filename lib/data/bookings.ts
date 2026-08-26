import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type Booking = Database['public']['Tables']['bookings']['Row'];

export type BookingWithListing = Booking & {
  listings:
    | {
        title: string;
        slug: string;
        images: string[];
        type: string;
        location: string;
        hosts: { business_name: string; contact_phone: string | null } | null;
      }
    | null;
  room_types: { name: string } | null;
  reviews: { id: string }[] | null;
};

const BOOKING_SELECT =
  '*, listings(title, slug, images, type, location, hosts(business_name, contact_phone)), room_types(name), reviews(id)';

// RLS scopes this to the signed-in guest's own bookings automatically.
export async function getMyBookings(): Promise<BookingWithListing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as BookingWithListing[];
  } catch {
    return [];
  }
}

export async function getBookingById(id: string): Promise<BookingWithListing | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as unknown as BookingWithListing;
  } catch {
    return null;
  }
}
