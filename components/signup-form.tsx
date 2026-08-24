'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signUp, type AuthFormState } from '@/app/actions/auth';
import { GoogleAuthButton, AuthDivider } from '@/components/google-auth-button';

const initialState: AuthFormState = { error: null };

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="space-y-4">
      <GoogleAuthButton next={redirectTo} label="Sign up with Google" />
      <AuthDivider />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Full name
          <input
            type="text"
            name="fullName"
            required
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Password
          <input
            type="password"
            name="password"
            minLength={8}
            required
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand-800 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-900 disabled:bg-brand-300"
    >
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  );
}
