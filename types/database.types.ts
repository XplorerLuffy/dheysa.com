// Hand-authored to match supabase/migrations/20260822000000_init_schema.sql.
// Once the project is linked to a real Supabase instance, regenerate with:
//   npm run supabase:types
// (requires the Supabase CLI: `supabase link` first).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'guest' | 'host' | 'admin';
export type HostVerificationStatus = 'pending' | 'verified' | 'rejected';
export type ListingType = 'hotel' | 'homestay' | 'tour' | 'transport';
export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      hosts: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          bio: string | null;
          verification_status: HostVerificationStatus;
          payout_details: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          bio?: string | null;
          verification_status?: HostVerificationStatus;
          payout_details?: Json;
        };
        Update: Partial<Database['public']['Tables']['hosts']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type?: string | null;
          description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          host_id: string;
          type: ListingType;
          title: string;
          slug: string;
          description: string | null;
          location: string;
          latitude: number | null;
          longitude: number | null;
          images: string[];
          price_base: number;
          currency: string;
          status: ListingStatus;
          curated_by_admin: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          type: ListingType;
          title: string;
          slug: string;
          description?: string | null;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          images?: string[];
          price_base: number;
          currency?: string;
          status?: ListingStatus;
          curated_by_admin?: boolean;
          featured?: boolean;
        };
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      listing_details: {
        Row: {
          listing_id: string;
          details: Json;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          details?: Json;
        };
        Update: Partial<Database['public']['Tables']['listing_details']['Insert']>;
      };
      availability: {
        Row: {
          id: string;
          listing_id: string;
          date: string;
          slots_available: number;
          price_override: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          date: string;
          slots_available?: number;
          price_override?: number | null;
        };
        Update: Partial<Database['public']['Tables']['availability']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          guest_id: string;
          listing_id: string;
          host_id: string;
          check_in: string | null;
          check_out: string | null;
          booking_date: string | null;
          guests_count: number;
          total_price: number;
          currency: string;
          status: BookingStatus;
          payment_status: PaymentStatus;
          payment_method: string | null;
          hold_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          listing_id: string;
          host_id: string;
          check_in?: string | null;
          check_out?: string | null;
          booking_date?: string | null;
          guests_count?: number;
          total_price: number;
          currency?: string;
          status?: BookingStatus;
          payment_status?: PaymentStatus;
          payment_method?: string | null;
          hold_expires_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          rating: number;
          comment: string | null;
          host_response: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          rating: number;
          comment?: string | null;
          host_response?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      listing_categories: {
        Row: {
          listing_id: string;
          category_id: string;
        };
        Insert: {
          listing_id: string;
          category_id: string;
        };
        Update: Partial<Database['public']['Tables']['listing_categories']['Insert']>;
      };
    };
  };
}
