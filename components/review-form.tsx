'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Star } from 'lucide-react';
import { submitReview, type ReviewFormState } from '@/app/actions/reviews';

const initialState: ReviewFormState = { error: null };

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-3xl border border-brand-950/5 p-6 shadow-soft"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-xs font-medium text-brand-500">Rating</p>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
              className="transition hover:scale-110"
            >
              <Star
                size={28}
                className={n <= rating ? 'fill-accent-400 text-accent-400' : 'fill-brand-100 text-brand-100'}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Comment (optional)
        <textarea
          name="comment"
          rows={4}
          className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
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
      className="rounded-xl bg-accent-500 px-5 py-2.5 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:bg-brand-100 disabled:text-brand-400 disabled:shadow-none"
    >
      {pending ? 'Submitting…' : 'Submit review'}
    </button>
  );
}
