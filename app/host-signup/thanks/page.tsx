import Link from 'next/link';
import { MailCheck, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { getCurrentUser } from '@/lib/auth';

export default async function HostSignupThanksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const email = typeof searchParams.email === 'string' ? searchParams.email : '';
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Reveal>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <MailCheck size={20} />
        </span>

        {user ? (
          <>
            <h1 className="mt-4 text-2xl font-bold text-brand-950">You’re all set</h1>
            <div className="mt-4 rounded-2xl border border-brand-950/10 bg-brand-50 p-5 text-sm text-brand-700">
              Your host application for <span className="font-semibold text-brand-950">DheySa</span> is in.
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold text-brand-950">Verify your account</h1>
            <div className="mt-4 rounded-2xl border border-brand-950/10 bg-brand-50 p-5 text-sm text-brand-700">
              <p>
                We sent you an email with a verification link
                {email && (
                  <>
                    {' '}
                    to <span className="font-semibold text-brand-950">{email}</span>
                  </>
                )}
                .
              </p>
              <p className="mt-2">To confirm your account, follow the link in the email we just sent.</p>
            </div>
          </>
        )}

        <p className="mt-4 text-sm text-brand-500">
          Once confirmed, our team will personally review your property and follow up within a couple of
          days.
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
