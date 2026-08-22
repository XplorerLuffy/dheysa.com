import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/';

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">Sign in</h1>
      <p className="mt-1 text-sm text-brand-500">Welcome back to DheySa.</p>
      <div className="mt-6">
        <LoginForm redirectTo={redirectTo} />
      </div>
      <p className="mt-6 text-sm text-brand-500">
        New here?{' '}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-brand-700 underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
