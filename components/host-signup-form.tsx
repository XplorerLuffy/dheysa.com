'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signUpHost, type HostSignupState } from '@/app/actions/host';
import { GoogleAuthButton, AuthDivider } from '@/components/google-auth-button';

const initialState: HostSignupState = { error: null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 1 | 2 | 3;

export function HostSignupForm() {
  const [state, formAction] = useFormState(signUpHost, initialState);
  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function goToStep2() {
    if (!EMAIL_RE.test(email)) {
      setStepError('Enter a valid email address.');
      return;
    }
    setStepError(null);
    setStep(2);
  }

  function goToStep3() {
    if (!firstName.trim()) {
      setStepError('Enter your first name.');
      return;
    }
    if (!businessName.trim()) {
      setStepError('Tell us the name of your property or business.');
      return;
    }
    setStepError(null);
    setStep(3);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (password.length < 8) {
      e.preventDefault();
      setStepError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      e.preventDefault();
      setStepError('Passwords don’t match.');
      return;
    }
    setStepError(null);
  }

  return (
    <div className="space-y-5">
      <StepIndicator step={step} />

      {/* Rendered outside the <form> below — a <form> can't nest inside
          another <form>, and GoogleAuthButton is its own form. */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Create your host account</h1>
          <p className="mt-1 text-sm text-brand-500">Create an account to list and manage your property.</p>
          <div className="mt-6">
            <GoogleAuthButton next="/host-signup/complete" label="Continue with Google" />
          </div>
          <div className="mt-4">
            <AuthDivider />
          </div>
        </div>
      )}

      <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      {/* All three steps stay mounted so their values are included in the
          final submit — only the active one is visible. */}
      <div className={step === 1 ? 'block' : 'hidden'}>
        <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {step === 1 && stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}

        <button
          type="button"
          onClick={goToStep2}
          className="mt-4 w-full rounded-xl bg-brand-800 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          Continue
        </button>

        <p className="mt-4 text-center text-sm text-brand-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-800 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>

      <div className={step === 2 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">Contact details</h1>
        <p className="mt-1 text-sm text-brand-500">Tell us a bit about you and your property.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            First name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-brand-500">
            Last name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Property or business name
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Riverside Serenity Hotel"
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Phone number (optional)
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+975"
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <span className="font-normal normal-case text-brand-400">
            In case our team has a question about your application.
          </span>
        </label>

        {step === 2 && stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStepError(null);
              setStep(1);
            }}
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-900"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goToStep3}
            className="flex-1 rounded-xl bg-brand-800 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-900"
          >
            Next
          </button>
        </div>
      </div>

      <div className={step === 3 ? 'block' : 'hidden'}>
        <h1 className="text-2xl font-bold text-brand-950">Create password</h1>
        <p className="mt-1 text-sm text-brand-500">Use a minimum of 8 characters.</p>

        <label className="mt-6 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Password
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-brand-500">
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-xl border border-brand-950/10 px-3.5 py-2.5 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {step === 3 && stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
        {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setStepError(null);
              setStep(2);
            }}
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-900"
          >
            Back
          </button>
          <SubmitButton />
        </div>

        <p className="mt-4 text-center text-xs text-brand-400">
          Your details are only used to review your application.
        </p>
      </div>

      {/* Hidden so the fields from earlier steps travel with the final submit. */}
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="businessName" value={businessName} />
      </form>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= step ? 'bg-brand-800' : 'bg-brand-100'
          }`}
        />
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-accent-500 px-4 py-3 font-bold text-brand-950 shadow-soft transition hover:bg-accent-400 disabled:bg-accent-200"
    >
      {pending ? 'Creating account…' : 'Create account'}
    </button>
  );
}
