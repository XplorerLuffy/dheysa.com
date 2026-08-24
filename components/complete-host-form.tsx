'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { completeHostApplication, type HostSignupState } from '@/app/actions/host';

const initialState: HostSignupState = { error: null };

export function CompleteHostForm() {
  const [state, formAction] = useFormState(completeHostApplication, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Property or business name
        <input
          type="text"
          name="businessName"
          placeholder="e.g. Riverside Serenity Hotel"
          required
          className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Phone number (optional)
        <input
          type="tel"
          name="phone"
          placeholder="+975"
          className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <span className="font-normal normal-case text-brand-400">
          In case our team has a question about your application.
        </span>
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
      className="w-full rounded-xl bg-accent-500 px-4 py-3 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:bg-accent-200"
    >
      {pending ? 'Saving…' : 'Continue'}
    </button>
  );
}
