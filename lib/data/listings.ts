import { createClient } from '@/lib/supabase/server';
import type { Database, ListingType } from '@/types/database.types';

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

// Every public list/detail query below swallows errors and returns an
// empty result rather than throwing — a fresh/unconfigured Supabase
// project (no data yet, or no env vars during local scaffolding) should
// render an empty state, not a 500 page.

export async function getFeaturedListings(limit = 6): Promise<ListingWithHost[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select('*, hosts(business_name, bio)')
      .eq('status', 'published')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as ListingWithHost[];
  } catch {
    return [];
  }
}

export type CuratedCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  listings: ListingWithHost[];
};

export async function getCuratedCollections(perCollection = 4): Promise<CuratedCollection[]> {
  try {
    const supabase = createClient();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name');
    if (error) throw error;
    if (!categories?.length) return [];

    const collections = await Promise.all(
      categories.map(async (category) => {
        const { data: joined } = await supabase
          .from('listing_categories')
          .select('listings(*, hosts(business_name, bio))')
          .eq('category_id', category.id)
          .limit(perCollection);

        const listings = (joined ?? [])
          .map((row: any) => row.listings)
          .filter((l: Listing | null) => l && l.status === 'published') as ListingWithHost[];

        return { ...category, listings };
      })
    );

    return collections.filter((c) => c.listings.length > 0);
  } catch {
    return [];
  }
}

export async function getListingsByType(
  type: ListingType,
  filters: BrowseFilters = {}
): Promise<ListingWithHost[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('listings')
      .select('*, hosts(business_name, bio)')
      .eq('status', 'published')
      .eq('type', type);

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (typeof filters.minPrice === 'number') {
      query = query.gte('price_base', filters.minPrice);
    }
    if (typeof filters.maxPrice === 'number') {
      query = query.lte('price_base', filters.maxPrice);
    }

    if (filters.sort === 'price_asc') {
      query = query.order('price_base', { ascending: true });
    } else if (filters.sort === 'price_desc') {
      query = query.order('price_base', { ascending: false });
    } else {
      query = query
        .order('curated_by_admin', { ascending: false })
        .order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    let listings = (data ?? []) as ListingWithHost[];

    if (filters.checkIn && filters.checkOut) {
      const availableIds = await filterListingIdsByAvailability(
        listings.map((l) => l.id),
        filters.checkIn,
        filters.checkOut
      );
      listings = listings.filter((l) => availableIds.has(l.id));
    }

    return listings;
  } catch {
    return [];
  }
}

async function filterListingIdsByAvailability(
  listingIds: string[],
  checkIn: string,
  checkOut: string
): Promise<Set<string>> {
  if (!listingIds.length) return new Set();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('availability')
      .select('listing_id, date, slots_available')
      .in('listing_id', listingIds)
      .gte('date', checkIn)
      .lt('date', checkOut);
    if (error) throw error;

    const nightsNeeded = new Set<string>();
    let d = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    while (d < end) {
      nightsNeeded.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }

    const byListing = new Map<string, Map<string, number>>();
    for (const row of data ?? []) {
      if (!byListing.has(row.listing_id)) byListing.set(row.listing_id, new Map());
      byListing.get(row.listing_id)!.set(row.date, row.slots_available);
    }

    const result = new Set<string>();
    for (const id of listingIds) {
      const nights = byListing.get(id);
      if (!nights) continue;
      const fullyAvailable = [...nightsNeeded].every((night) => (nights.get(night) ?? 0) > 0);
      if (fullyAvailable) result.add(id);
    }
    return result;
  } catch {
    return new Set();
  }
}

export type ListingDetail = ListingWithHost & {
  listing_details: { details: Record<string, unknown> } | null;
  categories: { id: string; name: string; slug: string }[];
};

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('listings')
      .select(
        '*, hosts(business_name, bio), listing_details(details), listing_categories(categories(id, name, slug))'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    if (error) throw error;
    if (!data) return null;

    const categories = ((data as any).listing_categories ?? [])
      .map((row: any) => row.categories)
      .filter(Boolean);

    return { ...(data as any), categories } as ListingDetail;
  } catch {
    return null;
  }
}

export type AvailabilityDay = {
  date: string;
  slots_available: number;
  price_override: number | null;
};

export async function getAvailability(
  listingId: string,
  from: string,
  to: string
): Promise<AvailabilityDay[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('availability')
      .select('date, slots_available, price_override')
      .eq('listing_id', listingId)
      .gte('date', from)
      .lt('date', to)
      .order('date');
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export type ListingReview = {
  id: string;
  rating: number;
  comment: string | null;
  host_response: string | null;
  created_at: string;
};

export type ListingRating = { avg: number; count: number };

export async function getRatingsForListings(
  listingIds: string[]
): Promise<Map<string, ListingRating>> {
  if (!listingIds.length) return new Map();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, bookings!inner(listing_id)')
      .in('bookings.listing_id', listingIds);
    if (error) throw error;

    const byListing = new Map<string, number[]>();
    for (const row of (data ?? []) as any[]) {
      const listingId = row.bookings?.listing_id as string | undefined;
      if (!listingId) continue;
      if (!byListing.has(listingId)) byListing.set(listingId, []);
      byListing.get(listingId)!.push(row.rating as number);
    }

    const result = new Map<string, ListingRating>();
    for (const [id, ratings] of byListing) {
      result.set(id, { avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length });
    }
    return result;
  } catch {
    return new Map();
  }
}

export async function getReviewsForListing(listingId: string): Promise<ListingReview[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, host_response, created_at, bookings!inner(listing_id)')
      .eq('bookings.listing_id', listingId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(({ id, rating, comment, host_response, created_at }) => ({
      id,
      rating,
      comment,
      host_response,
      created_at,
    }));
  } catch {
    return [];
  }
}
