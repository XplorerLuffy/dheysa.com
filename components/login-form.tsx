'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type AuthFormState } from '@/app/actions/auth';

const initialState: AuthFormState = { error: null };

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Email
        <input
          type="email"
          name="email"
          required
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
        Password
        <input
          type="password"
          name="password"
          required
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
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:bg-brand-300"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}
