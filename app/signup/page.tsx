import Link from 'next/link';
import { SignupForm } from '@/components/signup-form';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/';

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-900">Create your account</h1>
      <p className="mt-1 text-sm text-brand-500">Book curated stays &amp; experiences in GMC.</p>
      <div className="mt-6">
        <SignupForm redirectTo={redirectTo} />
      </div>
      <p className="mt-6 text-sm text-brand-500">
        Already have an account?{' '}
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-brand-700 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
