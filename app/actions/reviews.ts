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

  const supabase = createClient();
  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    rating,
    comment: comment || null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/trips/${bookingId}`);
}
