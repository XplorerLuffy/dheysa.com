'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitReview, type ReviewFormState } from '@/app/actions/reviews';

const initialState: ReviewFormState = { error: null };

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-xs font-medium text-brand-500">Rating</p>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              className={`text-2xl ${n <= rating ? 'text-amber-500' : 'text-brand-200'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Comment (optional)
        <textarea
          name="comment"
          rows={4}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:bg-brand-300"
    >
      {pending ? 'Submitting…' : 'Submit review'}
    </button>
  );
}
