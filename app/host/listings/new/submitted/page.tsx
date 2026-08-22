import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

export default function ListingSubmittedPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <Reveal>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-brand-950">Submitted for review</h1>
        <p className="mt-2 text-brand-600">
          Your listing is in. Our team personally reviews every property before it goes live — we’ll be
          in touch within a couple of days.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          Back to DheySa
          <ArrowRight size={14} />
        </Link>
      </Reveal>
    </main>
  );
}
