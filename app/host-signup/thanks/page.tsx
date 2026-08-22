import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

export default function HostSignupThanksPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-6 py-16">
      <Reveal className="w-full text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-brand-950">Application received</h1>
        <p className="mt-2 text-brand-600">
          If your account isn’t confirmed yet, check your email to activate it. Our team will review your
          property and follow up within a couple of days.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          Back to DheySa
        </Link>
      </Reveal>
    </main>
  );
}
