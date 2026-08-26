import type { Database } from '@/types/database.types';

export type Listing = Database['public']['Tables']['listings']['Row'];
export type ListingWithHost = Listing & {
  hosts: { business_name: string; bio: string | null } | null;
};

export type SortOption = 'curated' | 'price_asc' | 'price_desc';

export type BrowseFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  sort?: SortOption;
};

export type CuratedCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  listings: ListingWithHost[];
};

export type RoomType = Database['public']['Tables']['room_types']['Row'];

export type ListingDetail = ListingWithHost & {
  listing_details: { details: Record<string, unknown> } | null;
  categories: { id: string; name: string; slug: string }[];
  room_types: RoomType[];
};

export type AvailabilityDay = {
  date: string;
  slots_available: number;
  price_override: number | null;
};

export type ListingReview = {
  id: string;
  rating: number;
  comment: string | null;
  host_response: string | null;
  created_at: string;
};

export type ListingRating = { avg: number; count: number };
