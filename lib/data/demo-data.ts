// Static sample content for demo mode (see lib/demo.ts). Mirrors the shape
// of supabase/seed.sql's sample listings so the two stay consistent, but
// this data never touches the database — it's pure in-memory fixtures.
import type {
  ListingWithHost,
  ListingDetail,
  CuratedCollection,
  AvailabilityDay,
  ListingReview,
  ListingRating,
} from './types';
import type { ListingType } from '@/types/database.types';

const NOW = new Date().toISOString();
const HOST = {
  business_name: 'Gelephu Riverside Hospitality',
  bio: "A family-run hospitality group based in Gelephu, hosting travelers across GMC since the city's founding.",
};

function listing(overrides: Partial<ListingWithHost>): ListingWithHost {
  return {
    id: '',
    host_id: 'demo-host',
    type: 'hotel',
    title: '',
    slug: '',
    description: null,
    location: '',
    latitude: null,
    longitude: null,
    images: [],
    price_base: 0,
    currency: 'BTN',
    status: 'published',
    curated_by_admin: false,
    featured: false,
    created_at: NOW,
    updated_at: NOW,
    hosts: HOST,
    ...overrides,
  };
}

export const DEMO_RIVERSIDE = listing({
  id: 'demo-riverside-serenity-hotel',
  type: 'hotel',
  title: 'Riverside Serenity Hotel',
  slug: 'demo-riverside-serenity-hotel',
  description:
    'A calm, modern hotel on the banks of the Gelephu river, ten minutes from the mindfulness gardens. Every room looks out over water or forest.',
  location: 'Riverside, GMC',
  images: [
    'https://picsum.photos/id/1040/1200/800',
    'https://picsum.photos/id/1041/1200/800',
    'https://picsum.photos/id/1043/1200/800',
  ],
  price_base: 3800,
  curated_by_admin: true,
  featured: true,
});

export const DEMO_TOWN_CENTRE = listing({
  id: 'demo-gmc-town-centre-inn',
  type: 'hotel',
  title: 'GMC Town Centre Inn',
  slug: 'demo-gmc-town-centre-inn',
  description:
    'A straightforward, well-kept inn right in the town centre — walkable to the markets and the main square.',
  location: 'Town Centre, GMC',
  images: ['https://picsum.photos/id/1029/1200/800', 'https://picsum.photos/id/1031/1200/800'],
  price_base: 2200,
});

export const DEMO_WANGMO = listing({
  id: 'demo-wangmo-family-homestay',
  type: 'homestay',
  title: 'Wangmo Family Homestay',
  slug: 'demo-wangmo-family-homestay',
  description:
    'Stay with a local family in a traditional Bhutanese home. Home-cooked meals, a shared courtyard, and genuine conversation.',
  location: 'Hillside District, GMC',
  images: [
    'https://picsum.photos/id/1050/1200/800',
    'https://picsum.photos/id/1074/1200/800',
    'https://picsum.photos/id/1080/1200/800',
  ],
  price_base: 1600,
  curated_by_admin: true,
  featured: true,
});

export const DEMO_MINDFUL_GARDEN = listing({
  id: 'demo-mindful-garden-homestay',
  type: 'homestay',
  title: 'Mindful Garden Homestay',
  slug: 'demo-mindful-garden-homestay',
  description:
    'A quiet homestay bordering the mindfulness gardens, with a private meditation corner and organic vegetable garden.',
  location: 'Mindfulness Gardens District, GMC',
  images: ['https://picsum.photos/id/1015/1200/800', 'https://picsum.photos/id/1016/1200/800'],
  price_base: 1900,
});

const DEMO_LISTINGS = [DEMO_RIVERSIDE, DEMO_TOWN_CENTRE, DEMO_WANGMO, DEMO_MINDFUL_GARDEN];

const DEMO_DETAILS: Record<string, Record<string, unknown>> = {
  [DEMO_RIVERSIDE.id]: {
    amenities: ['Free WiFi', 'River view', 'Breakfast included', 'Meditation room', 'Air conditioning'],
    room_count: 24,
    max_guests: 3,
  },
  [DEMO_TOWN_CENTRE.id]: {
    amenities: ['Free WiFi', '24-hour front desk', 'Laundry service'],
    room_count: 16,
    max_guests: 2,
  },
  [DEMO_WANGMO.id]: {
    amenities: ['Home-cooked meals', 'Shared courtyard', 'Traditional architecture'],
    house_rules: ['No smoking indoors', 'Quiet hours after 9pm'],
    max_guests: 4,
  },
  [DEMO_MINDFUL_GARDEN.id]: {
    amenities: ['Organic garden', 'Private meditation corner', 'Free WiFi'],
    house_rules: ['No pets', 'Check-in after 2pm'],
    max_guests: 2,
  },
};

const DEMO_ROOM_TYPES: Record<string, ListingDetail['room_types']> = {
  [DEMO_RIVERSIDE.id]: [
    {
      id: 'demo-rt-riverside-standard',
      listing_id: DEMO_RIVERSIDE.id,
      name: 'Standard Room',
      price: 3200,
      max_guests: 2,
      room_count: 14,
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: 'demo-rt-riverside-river-view',
      listing_id: DEMO_RIVERSIDE.id,
      name: 'River View Room',
      price: 3800,
      max_guests: 3,
      room_count: 8,
      created_at: NOW,
      updated_at: NOW,
    },
    {
      id: 'demo-rt-riverside-suite',
      listing_id: DEMO_RIVERSIDE.id,
      name: 'Family Suite',
      price: 5200,
      max_guests: 4,
      room_count: 2,
      created_at: NOW,
      updated_at: NOW,
    },
  ],
  [DEMO_TOWN_CENTRE.id]: [
    {
      id: 'demo-rt-towncentre-standard',
      listing_id: DEMO_TOWN_CENTRE.id,
      name: 'Standard Room',
      price: 2200,
      max_guests: 2,
      room_count: 16,
      created_at: NOW,
      updated_at: NOW,
    },
  ],
};

const DEMO_CATEGORIES = {
  mindfulness: { id: 'demo-cat-mindfulness', name: 'Mindfulness Retreats', slug: 'mindfulness-retreats' },
  family: { id: 'demo-cat-family', name: 'Family Friendly', slug: 'family-friendly' },
};

const DEMO_LISTING_CATEGORIES: Record<string, (typeof DEMO_CATEGORIES)[keyof typeof DEMO_CATEGORIES][]> = {
  [DEMO_RIVERSIDE.id]: [DEMO_CATEGORIES.mindfulness],
  [DEMO_WANGMO.id]: [DEMO_CATEGORIES.mindfulness, DEMO_CATEGORIES.family],
  [DEMO_MINDFUL_GARDEN.id]: [DEMO_CATEGORIES.mindfulness],
};

const DEMO_RATINGS: Record<string, ListingRating> = {
  [DEMO_RIVERSIDE.id]: { avg: 4.6, count: 12 },
  [DEMO_TOWN_CENTRE.id]: { avg: 4.1, count: 5 },
  [DEMO_WANGMO.id]: { avg: 5.0, count: 8 },
  [DEMO_MINDFUL_GARDEN.id]: { avg: 4.3, count: 3 },
};

const DEMO_REVIEWS: Record<string, ListingReview[]> = {
  [DEMO_RIVERSIDE.id]: [
    {
      id: 'demo-r1',
      rating: 5,
      comment: 'Exactly the calm we were looking for. The river view room was stunning at sunrise.',
      host_response: 'Thank you for staying with us — see you again soon!',
      created_at: NOW,
    },
    {
      id: 'demo-r2',
      rating: 4,
      comment: 'Great location and very peaceful. Breakfast was simple but good.',
      host_response: null,
      created_at: NOW,
    },
    {
      id: 'demo-r3',
      rating: 5,
      comment: 'Staff were wonderful, and the meditation room was a lovely surprise.',
      host_response: null,
      created_at: NOW,
    },
  ],
  [DEMO_WANGMO.id]: [
    {
      id: 'demo-r4',
      rating: 5,
      comment: 'Felt like family within a day. The home-cooked meals alone are worth the stay.',
      host_response: 'You are always welcome back!',
      created_at: NOW,
    },
  ],
};

function generateAvailability(days: number): AvailabilityDay[] {
  const out: AvailabilityDay[] = [];
  const d = new Date();
  for (let i = 0; i < days; i++) {
    out.push({ date: d.toISOString().slice(0, 10), slots_available: 3, price_override: null });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export async function getDemoFeaturedListings(limit: number): Promise<ListingWithHost[]> {
  return DEMO_LISTINGS.filter((l) => l.featured).slice(0, limit);
}

export async function getDemoCuratedCollections(perCollection: number): Promise<CuratedCollection[]> {
  const byCategory = new Map<string, ListingWithHost[]>();
  for (const l of DEMO_LISTINGS) {
    for (const cat of DEMO_LISTING_CATEGORIES[l.id] ?? []) {
      if (!byCategory.has(cat.slug)) byCategory.set(cat.slug, []);
      byCategory.get(cat.slug)!.push(l);
    }
  }
  return Object.values(DEMO_CATEGORIES)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description:
        cat.slug === 'mindfulness-retreats'
          ? 'Stays built around quiet, reflection, and nature.'
          : 'Spacious stays that work well for families.',
      listings: (byCategory.get(cat.slug) ?? []).slice(0, perCollection),
    }))
    .filter((c) => c.listings.length > 0);
}

export async function getDemoListingsByType(
  type: ListingType,
  sort?: 'curated' | 'price_asc' | 'price_desc'
): Promise<ListingWithHost[]> {
  let listings = DEMO_LISTINGS.filter((l) => l.type === type);
  if (sort === 'price_asc') listings = [...listings].sort((a, b) => a.price_base - b.price_base);
  if (sort === 'price_desc') listings = [...listings].sort((a, b) => b.price_base - a.price_base);
  return listings;
}

export async function getDemoListingBySlug(slug: string): Promise<ListingDetail | null> {
  const found = DEMO_LISTINGS.find((l) => l.slug === slug);
  if (!found) return null;
  return {
    ...found,
    listing_details: { details: DEMO_DETAILS[found.id] ?? {} },
    categories: DEMO_LISTING_CATEGORIES[found.id] ?? [],
    room_types: DEMO_ROOM_TYPES[found.id] ?? [],
  };
}

export async function getDemoAvailability(from: string, to: string): Promise<AvailabilityDay[]> {
  const days = Math.max(
    1,
    Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86400000)
  );
  return generateAvailability(days);
}

export async function getDemoRatingsForListings(listingIds: string[]): Promise<Map<string, ListingRating>> {
  const result = new Map<string, ListingRating>();
  for (const id of listingIds) {
    if (DEMO_RATINGS[id]) result.set(id, DEMO_RATINGS[id]);
  }
  return result;
}

export async function getDemoReviewsForListing(listingId: string): Promise<ListingReview[]> {
  return DEMO_REVIEWS[listingId] ?? [];
}
