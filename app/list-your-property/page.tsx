import Link from 'next/link';
import { ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { StaggerGroup } from '@/components/motion/stagger-group';

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Tell us about your place',
    body: 'Create an account and share a few details — location, type, and photos.',
  },
  {
    icon: ShieldCheck,
    title: 'We review it',
    body: 'Our team personally verifies every host before a listing goes live — that’s the DheySa promise.',
  },
  {
    icon: Sparkles,
    title: 'Go live in GMC',
    body: 'Once approved, guests across Gelephu Mindfulness City can find and book your place.',
  },
];

export default function ListYourPropertyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">For hosts</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl">
          List your property on DheySa
        </h1>
        <p className="mt-4 max-w-xl text-brand-600">
          DheySa is a curated marketplace for Gelephu Mindfulness City — every listing is personally
          reviewed by our team before it goes live, so guests trust what they book. We're onboarding
          hotels, homestays, and local experiences one at a time to keep quality high.
        </p>
      </Reveal>

      <StaggerGroup className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-2xl border border-brand-950/5 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <step.icon size={16} />
            </span>
            <p className="mt-3 text-xs font-semibold text-accent-600">Step {i + 1}</p>
            <p className="mt-1 font-semibold text-brand-950">{step.title}</p>
            <p className="mt-1 text-sm text-brand-500">{step.body}</p>
          </div>
        ))}
      </StaggerGroup>

      <Reveal className="mt-10 rounded-2xl border border-brand-950/10 bg-brand-50 p-6">
        <h2 className="font-semibold text-brand-950">Ready to get started?</h2>
        <p className="mt-1 text-sm text-brand-600">
          Create an account and our team will follow up to verify your property and set up your first
          listing.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
        >
          Create a host account
        </Link>
      </Reveal>
    </main>
  );
}
