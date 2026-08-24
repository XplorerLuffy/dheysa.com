import Link from 'next/link';
import { LoginForm } from '@/components/login-form';
import { Reveal } from '@/components/motion/reveal';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/';
  const googleUnavailable = searchParams.error === 'google_unavailable';

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-brand-950">Sign in</h1>
          <p className="mt-1 text-sm text-brand-500">Welcome back to DheySa.</p>
          {googleUnavailable && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              Google sign-in isn&apos;t available right now. Please use email and password, or try
              again shortly.
            </p>
          )}
          <div className="mt-6">
            <LoginForm redirectTo={redirectTo} />
          </div>
          <p className="mt-6 text-sm text-brand-500">
            New here?{' '}
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-brand-800 underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>
        </div>
      </Reveal>
    </main>
  );
}
