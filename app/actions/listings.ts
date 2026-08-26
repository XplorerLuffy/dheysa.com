'use server';

import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export type ListingFormState = { error: string | null };

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'listing'
  );
}

function parseListingForm(formData: FormData) {
  const type = String(formData.get('type') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceBase = Number(formData.get('priceBase') ?? 0);
  const maxGuests = Number(formData.get('maxGuests') ?? 0) || null;
  const bedrooms = Number(formData.get('bedrooms') ?? 0) || null;
  const bathrooms = Number(formData.get('bathrooms') ?? 0) || null;
  const roomCount = Number(formData.get('roomCount') ?? 0) || null;
  const sizeSqm = Number(formData.get('sizeSqm') ?? 0) || null;
  const amenities = formData.getAll('amenities').map(String);
  const languages = formData.getAll('languages').map(String);
  const images = formData.getAll('images').map(String);

  let roomTypes: Array<{ name: string; price: number; max_guests: number; count: number }> = [];
  try {
    const raw = JSON.parse(String(formData.get('roomTypes') ?? '[]'));
    if (Array.isArray(raw)) {
      roomTypes = raw
        .map((rt) => ({
          name: String(rt?.name ?? '').trim(),
          price: Number(rt?.price) || 0,
          max_guests: Number(rt?.maxGuests) || 0,
          count: Number(rt?.count) || 0,
        }))
        .filter((rt) => rt.name);
    }
  } catch {
    roomTypes = [];
  }

  const houseRules = {
    smoking_allowed: formData.get('smokingAllowed') === 'true',
    parties_allowed: formData.get('partiesAllowed') === 'true',
    children_allowed: formData.get('childrenAllowed') === 'true',
    pets_allowed: String(formData.get('petsAllowed') ?? 'no'),
    check_in: { from: String(formData.get('checkInFrom') ?? ''), until: String(formData.get('checkInUntil') ?? '') },
    check_out: {
      from: String(formData.get('checkOutFrom') ?? ''),
      until: String(formData.get('checkOutUntil') ?? ''),
    },
  };

  return {
    type,
    title,
    location,
    description,
    priceBase,
    maxGuests,
    bedrooms,
    bathrooms,
    roomCount,
    sizeSqm,
    amenities,
    languages,
    images,
    roomTypes,
    houseRules,
  };
}

function validateListingForm(fields: ReturnType<typeof parseListingForm>): string | null {
  if (fields.type !== 'hotel' && fields.type !== 'homestay') {
    return 'Choose a property type.';
  }
  if (!fields.title) {
    return 'Enter a property name.';
  }
  if (!fields.location) {
    return 'Enter a location.';
  }
  if (!fields.priceBase || fields.priceBase <= 0) {
    return 'Enter a nightly price.';
  }
  return null;
}

function detailsPayload(fields: ReturnType<typeof parseListingForm>) {
  return {
    amenities: fields.amenities,
    max_guests: fields.maxGuests,
    bedrooms: fields.bedrooms,
    bathrooms: fields.bathrooms,
    size_sqm: fields.sizeSqm,
    languages_spoken: fields.languages,
    house_rules: fields.houseRules,
    ...(fields.type === 'hotel' ? { room_count: fields.roomCount, room_types: fields.roomTypes } : {}),
  };
}

// Creates a draft listing submitted for review — mirrors the schema's
// existing "hosts can freely create/edit drafts and submit for review,
// only an admin may publish" rule (enforce_listing_publish_rules trigger).
// Nothing here makes a listing live; it just queues it for the team.
export async function submitListing(_prevState: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const fields = parseListingForm(formData);
  const validationError = validateListingForm(fields);
  if (validationError) return { error: validationError };

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Sign in to continue.' };
    }

    const { data: host } = await supabase.from('hosts').select('id').eq('user_id', user.id).maybeSingle();
    if (!host) {
      return { error: 'We couldn’t find a host application for your account.' };
    }

    const slug = `${slugify(fields.title)}-${Math.random().toString(36).slice(2, 7)}`;

    // Generate the id ourselves instead of reading it back via
    // .select().single() after insert. Confirmed directly against
    // Postgres: the exact same INSERT succeeds under this RLS policy
    // without RETURNING, but fails with "new row violates row-level
    // security policy" when RETURNING is added — even though the row is
    // fully visible to a normal SELECT run immediately afterward. Rather
    // than depend on that RETURNING-specific behavior, skip it.
    const listingId = randomUUID();

    const { error: listingError } = await supabase.from('listings').insert({
      id: listingId,
      host_id: host.id,
      type: fields.type as 'hotel' | 'homestay',
      title: fields.title,
      slug,
      description: fields.description || null,
      location: fields.location,
      price_base: fields.priceBase,
      images: fields.images,
      status: 'pending_review',
    });

    if (listingError) {
      return { error: listingError.message };
    }

    const { error: detailsError } = await supabase.from('listing_details').insert({
      listing_id: listingId,
      details: detailsPayload(fields),
    });

    if (detailsError) {
      return { error: detailsError.message };
    }
  } catch (error) {
    console.error('submitListing failed:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/host/listings/new/submitted');
}

// Updates a host's own listing in place. Deliberately never sends `status`
// — enforce_listing_publish_rules only resets status to pending_review when
// a non-admin tries to move status INTO 'published' from something else, so
// leaving it untouched here means editing an already-published listing's
// content doesn't knock it back into review, while RLS (listings_update_own_or_admin)
// still guarantees a host can only ever reach their own row.
export async function updateListing(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const fields = parseListingForm(formData);
  const validationError = validateListingForm(fields);
  if (validationError) return { error: validationError };

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Sign in to continue.' };
    }

    const { error: listingError } = await supabase
      .from('listings')
      .update({
        type: fields.type as 'hotel' | 'homestay',
        title: fields.title,
        description: fields.description || null,
        location: fields.location,
        price_base: fields.priceBase,
        images: fields.images,
      })
      .eq('id', listingId);

    if (listingError) {
      return { error: listingError.message };
    }

    const { error: detailsError } = await supabase
      .from('listing_details')
      .update({ details: detailsPayload(fields) })
      .eq('listing_id', listingId);

    if (detailsError) {
      return { error: detailsError.message };
    }
  } catch (error) {
    console.error('updateListing failed:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/host/listings?updated=1');
}
