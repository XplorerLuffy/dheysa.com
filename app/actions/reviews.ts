'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ReviewFormState = { error: string | null };

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const bookingId = String(formData.get('bookingId') ?? '');
  const rating = Number(formData.get('rating') ?? 0);
  const comment = String(formData.get('comment') ?? '').trim();

  if (!bookingId) {
    return { error: 'Missing booking.' };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Choose a rating between 1 and 5.' };
  }

  let submitError: string | null = null;
  try {
    const supabase = createClient();
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      rating,
      comment: comment || null,
    });
    submitError = error?.message ?? null;
  } catch (error) {
    console.error('submitReview failed:', error);
    return { error: 'Could not submit your review. Please try again shortly.' };
  }

  if (submitError) {
    return { error: submitError };
  }

  redirect(`/trips/${bookingId}`);
}
