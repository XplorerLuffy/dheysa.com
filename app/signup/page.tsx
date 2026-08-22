import Link from 'next/link';
import { SignupForm } from '@/components/signup-form';
import { Reveal } from '@/components/motion/reveal';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/';

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-brand-950">Create your account</h1>
          <p className="mt-1 text-sm text-brand-500">Book curated stays &amp; experiences in GMC.</p>
          <div className="mt-6">
            <SignupForm redirectTo={redirectTo} />
          </div>
          <p className="mt-6 text-sm text-brand-500">
            Already have an account?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-brand-800 underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Reveal>
    </main>
  );
}
