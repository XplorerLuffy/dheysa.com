import { redirect } from 'next/navigation';
import { CompleteHostForm } from '@/components/complete-host-form';
import { Reveal } from '@/components/motion/reveal';
import { getCurrentUser } from '@/lib/auth';

// Landing spot for a host who signed up via Google — Google authenticates
// them immediately (no email-confirmation gap like the password path), but
// gives us no business name or phone, so this collects just those.
export default async function CompleteHostSignupPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/host-signup');
  if (user.host) redirect('/host/listings/new');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-brand-950">A few more details</h1>
          <p className="mt-1 text-sm text-brand-500">
            Tell us about your property so our team can review your application.
          </p>
          <div className="mt-6">
            <CompleteHostForm />
          </div>
        </div>
      </Reveal>
    </main>
  );
}
