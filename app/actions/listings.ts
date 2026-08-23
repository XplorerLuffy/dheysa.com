'use server';

import { redirect } from 'next/navigation';
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

// Creates a draft listing submitted for review — mirrors the schema's
// existing "hosts can freely create/edit drafts and submit for review,
// only an admin may publish" rule (enforce_listing_publish_rules trigger).
// Nothing here makes a listing live; it just queues it for the team.
export async function submitListing(_prevState: ListingFormState, formData: FormData): Promise<ListingFormState> {
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

  if (type !== 'hotel' && type !== 'homestay') {
    return { error: 'Choose a property type.' };
  }
  if (!title) {
    return { error: 'Enter a property name.' };
  }
  if (!location) {
    return { error: 'Enter a location.' };
  }
  if (!priceBase || priceBase <= 0) {
    return { error: 'Enter a nightly price.' };
  }

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

    const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        host_id: host.id,
        type: type as 'hotel' | 'homestay',
        title,
        slug,
        description: description || null,
        location,
        price_base: priceBase,
        images,
        status: 'pending_review',
      })
      .select('id')
      .single();

    if (listingError || !listing) {
      return { error: listingError?.message ?? 'Could not submit your listing. Try again.' };
    }

    const { error: detailsError } = await supabase.from('listing_details').insert({
      listing_id: listing.id,
      details: {
        amenities,
        max_guests: maxGuests,
        bedrooms,
        bathrooms,
        size_sqm: sizeSqm,
        languages_spoken: languages,
        house_rules: houseRules,
        ...(type === 'hotel' ? { room_count: roomCount } : {}),
      },
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
