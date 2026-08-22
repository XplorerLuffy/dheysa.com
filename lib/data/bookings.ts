import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type Booking = Database['public']['Tables']['bookings']['Row'];

export type BookingWithListing = Booking & {
  listings: { title: string; slug: string; images: string[]; type: string; location: string } | null;
  reviews: { id: string }[] | null;
};

// RLS scopes this to the signed-in guest's own bookings automatically.
export async function getMyBookings(): Promise<BookingWithListing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listings(title, slug, images, type, location), reviews(id)')
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
      .select('*, listings(title, slug, images, type, location), reviews(id)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as unknown as BookingWithListing;
  } catch {
    return null;
  }
}
