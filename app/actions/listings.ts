'use server';

import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { addDays, todayISO } from '@/lib/format';

export type ListingFormState = { error: string | null };

type SupabaseClient = ReturnType<typeof createClient>;

const AVAILABILITY_WINDOW_DAYS = 90;

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

  let roomTypes: Array<{ id: string | null; name: string; price: number; max_guests: number; count: number }> = [];
  try {
    const raw = JSON.parse(String(formData.get('roomTypes') ?? '[]'));
    if (Array.isArray(raw)) {
      roomTypes = raw
        .map((rt) => ({
          id: rt?.id ? String(rt.id) : null,
          name: String(rt?.name ?? '').trim(),
          price: Number(rt?.price) || 0,
          max_guests: Math.max(Number(rt?.maxGuests) || 0, 1),
          count: Math.max(Number(rt?.count) || 0, 1),
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
  if (fields.type === 'hotel' && fields.roomTypes.length === 0) {
    return 'Add at least one room type — that’s what guests actually book.';
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
    ...(fields.type === 'hotel' ? { room_count: fields.roomCount } : {}),
  };
}

// Seeds a fresh room type with a flat 90-day availability window. Uses
// upsert+ignoreDuplicates (-> ON CONFLICT DO NOTHING) rather than a plain
// insert purely as a safety net against re-running for the same id; a
// brand-new room type has no existing rows to conflict with.
async function seedRoomTypeAvailability(supabase: SupabaseClient, roomTypeId: string, roomCount: number) {
  const today = todayISO();
  const rows = Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, i) => ({
    room_type_id: roomTypeId,
    date: addDays(today, i),
    slots_available: roomCount,
  }));
  await supabase
    .from('room_type_availability')
    .upsert(rows, { onConflict: 'room_type_id,date', ignoreDuplicates: true });
}

// When a host changes an existing room type's count, shift every future
// availability row by the delta instead of overwriting it outright —
// overwriting would silently undo whatever a real booking had already
// deducted from those days.
async function adjustFutureRoomTypeAvailability(supabase: SupabaseClient, roomTypeId: string, delta: number) {
  if (delta === 0) return;
  const { data: rows } = await supabase
    .from('room_type_availability')
    .select('id, slots_available')
    .eq('room_type_id', roomTypeId)
    .gte('date', todayISO());
  if (!rows?.length) return;

  await Promise.all(
    rows.map((row) =>
      supabase
        .from('room_type_availability')
        .update({ slots_available: Math.max(0, row.slots_available + delta) })
        .eq('id', row.id)
    )
  );
}

async function createRoomTypes(
  supabase: SupabaseClient,
  listingId: string,
  roomTypes: ReturnType<typeof parseListingForm>['roomTypes']
): Promise<string | null> {
  for (const rt of roomTypes) {
    const roomTypeId = randomUUID();
    const { error } = await supabase.from('room_types').insert({
      id: roomTypeId,
      listing_id: listingId,
      name: rt.name,
      price: rt.price,
      max_guests: rt.max_guests,
      room_count: rt.count,
    });
    if (error) return error.message;
    await seedRoomTypeAvailability(supabase, roomTypeId, rt.count);
  }
  return null;
}

// Diffs the submitted room types against what's already in the table:
// updates ones that carried an id, inserts (+ seeds availability) ones
// that didn't, deletes ones no longer present. A room type still
// referenced by a booking can't be deleted (on delete restrict) — that
// surfaces as a normal error message rather than crashing.
async function syncRoomTypes(
  supabase: SupabaseClient,
  listingId: string,
  roomTypes: ReturnType<typeof parseListingForm>['roomTypes']
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('room_types')
    .select('id, room_count')
    .eq('listing_id', listingId);
  const existingById = new Map((existing ?? []).map((rt) => [rt.id, rt]));
  const submittedIds = new Set(roomTypes.filter((rt) => rt.id).map((rt) => rt.id));

  const toDelete = [...existingById.keys()].filter((id) => !submittedIds.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from('room_types').delete().in('id', toDelete);
    if (error) return error.message;
  }

  for (const rt of roomTypes) {
    if (rt.id && existingById.has(rt.id)) {
      const previous = existingById.get(rt.id)!;
      const { error } = await supabase
        .from('room_types')
        .update({ name: rt.name, price: rt.price, max_guests: rt.max_guests, room_count: rt.count })
        .eq('id', rt.id);
      if (error) return error.message;
      await adjustFutureRoomTypeAvailability(supabase, rt.id, rt.count - previous.room_count);
    } else {
      const roomTypeId = randomUUID();
      const { error } = await supabase.from('room_types').insert({
        id: roomTypeId,
        listing_id: listingId,
        name: rt.name,
        price: rt.price,
        max_guests: rt.max_guests,
        room_count: rt.count,
      });
      if (error) return error.message;
      await seedRoomTypeAvailability(supabase, roomTypeId, rt.count);
    }
  }

  return null;
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

    if (fields.type === 'hotel') {
      const roomTypeError = await createRoomTypes(supabase, listingId, fields.roomTypes);
      if (roomTypeError) return { error: roomTypeError };
    } else {
      // Homestays are a single unit, not a set of room types — seed the
      // listing-level availability table the same way createRoomTypes
      // seeds room_type_availability, since nothing else ever has before
      // now (this was the actual cause of newly-created listings being
      // unbookable: no availability rows existed until seed.sql for the
      // demo data, or a one-off migration backfill for anything real).
      const today = todayISO();
      const rows = Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, i) => ({
        listing_id: listingId,
        date: addDays(today, i),
        slots_available: 1,
      }));
      await supabase.from('availability').upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: true });
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

    if (fields.type === 'hotel') {
      const roomTypeError = await syncRoomTypes(supabase, listingId, fields.roomTypes);
      if (roomTypeError) return { error: roomTypeError };
    }
  } catch (error) {
    console.error('updateListing failed:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/host/listings?updated=1');
}

// Sends a rejected (draft) listing back for review. Setting status to
// 'pending_review' isn't blocked for a host by enforce_listing_publish_rules
// — only a direct jump to 'published' is — so this is just the status flip,
// no field validation needed since the listing already has real content.
export async function resubmitListing(listingId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('listings').update({ status: 'pending_review' }).eq('id', listingId);
  } catch (error) {
    console.error('resubmitListing failed:', error);
  }
  redirect('/host/listings');
}
