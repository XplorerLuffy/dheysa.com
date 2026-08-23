import Link from 'next/link';
import {
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ReceiptText,
  Wallet,
  CheckCircle2,
  Lock,
  Users2,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { StaggerGroup } from '@/components/motion/stagger-group';

const START_STEPS = [
  {
    icon: MessageCircle,
    title: 'Tell us about your place',
    body: 'Create an account and share a few details — location, type, photos, and pricing.',
  },
  {
    icon: ShieldCheck,
    title: 'A real person reviews it',
    body: 'No black-box algorithm — our team personally verifies every host before a listing goes live.',
  },
  {
    icon: Sparkles,
    title: 'Stand out in a curated market',
    body: 'A focused selection means your listing doesn’t get buried — guests see quality, not clutter.',
  },
];

const PAYMENT_POINTS = [
  {
    icon: ReceiptText,
    title: 'A simple 5% commission',
    body: 'DheySa takes 5% per booking — you keep 95% of every night you host. No tiers, no surprise add-ons.',
  },
  {
    icon: Wallet,
    title: 'Secure bank transfer',
    body: 'Guests pay by bank transfer, and our team confirms every payment against the booking.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirmed by our team',
    body: 'Nothing goes live or gets marked paid without a person on our side checking it first.',
  },
  {
    icon: Lock,
    title: 'No hidden platform games',
    body: 'One flat rate, agreed upfront — no surprise fees buried in fine print.',
  },
];

const WORRY_FREE_POINTS = [
  {
    title: 'Your listing, your rules',
    items: ['Set your own pricing and availability.', 'Describe your place the way you want guests to see it.'],
  },
  {
    title: 'Know who’s booking',
    items: ['Every booking runs through DheySa’s flow, not a walk-up stranger.', 'Guest and stay details up front, before check-in.'],
  },
  {
    title: 'Personal support',
    items: ['A direct line to our small team, not a ticket queue.', 'We’re based in GMC and know the area.'],
  },
];

const WHY_DHEYSA = [
  {
    icon: Sparkles,
    title: 'Curated, not crowded',
    body: 'We’d rather feature a handful of great places than bury you in an endless, low-trust list.',
  },
  {
    icon: Users2,
    title: 'A local team, not a call center',
    body: 'Every host works directly with people who know Gelephu Mindfulness City.',
  },
  {
    icon: HeartHandshake,
    title: 'Built specifically for GMC',
    body: 'Not a generic global platform — DheySa exists for this one destination, done well.',
  },
];

export default function ListYourPropertyPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath d='M0 90 L30 40 L50 65 L75 25 L120 90' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E\")",
            backgroundSize: '240px 240px',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-100">
              <Sparkles size={13} className="text-accent-400" />
              New in Gelephu Mindfulness City
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              List your <span className="text-accent-400">hotel or homestay</span> on DheySa
            </h1>
            <p className="mt-4 max-w-md text-brand-200">
              Reach guests searching specifically for Gelephu Mindfulness City — on a marketplace
              where every listing is personally vetted, not self-serve.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-white p-6 shadow-lift sm:p-8">
              <h2 className="text-xl font-bold text-brand-950">Get started</h2>
              <ul className="mt-4 space-y-3">
                {[
                  'Create your account in a couple of minutes.',
                  'Our team personally reviews your property.',
                  'We help set up your first listing with you.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-brand-600">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/host-signup"
                className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-brand-950 transition hover:bg-accent-400"
              >
                Create a host account
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <p className="mt-4 text-center text-sm text-brand-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-brand-800 underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
            Simple to start, built for GMC
          </h2>
        </Reveal>
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {START_STEPS.map((step) => (
            <div key={step.title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <step.icon size={20} />
              </span>
              <p className="mt-4 font-semibold text-brand-950">{step.title}</p>
              <p className="mt-1.5 text-sm text-brand-500">{step.body}</p>
            </div>
          ))}
        </StaggerGroup>
        <Reveal className="mt-8">
          <Link
            href="/host-signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
          >
            Get started today
          </Link>
        </Reveal>
      </section>

      <section className="bg-brand-50/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
              Straightforward payments
            </h2>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {PAYMENT_POINTS.map((point) => (
              <div key={point.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-soft">
                  <point.icon size={15} />
                </span>
                <div>
                  <p className="font-semibold text-brand-950">{point.title}</p>
                  <p className="mt-0.5 text-sm text-brand-500">{point.body}</p>
                </div>
              </div>
            ))}
          </StaggerGroup>
          <Reveal className="mt-8">
            <Link
              href="/host-signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
            >
              Start hosting today
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
            Host worry-free. We’ve got your back
          </h2>
        </Reveal>
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {WORRY_FREE_POINTS.map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-brand-950">{group.title}</p>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-brand-500">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerGroup>
        <Reveal className="mt-8">
          <Link
            href="/host-signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
          >
            Host with us today
          </Link>
        </Reveal>
      </section>

      <section className="bg-brand-50/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
              Why host with DheySa
            </h2>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {WHY_DHEYSA.map((point) => (
              <div key={point.title} className="rounded-2xl border border-brand-950/5 bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <point.icon size={18} />
                </span>
                <p className="mt-4 font-semibold text-brand-950">{point.title}</p>
                <p className="mt-1.5 text-sm text-brand-500">{point.body}</p>
              </div>
            ))}
          </StaggerGroup>

          <Reveal className="mt-10 flex flex-col items-start gap-4 rounded-3xl bg-brand-900 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to list your property?</h3>
              <p className="mt-1 text-sm text-brand-200">
                Create an account and our team will follow up to verify your place.
              </p>
            </div>
            <Link
              href="/host-signup"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-5 py-3 text-sm font-bold text-brand-950 transition hover:bg-accent-400"
            >
              Join hosts like you
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
