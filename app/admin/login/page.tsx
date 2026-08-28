import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminLoginForm } from '@/components/admin-login-form';
import { Reveal } from '@/components/motion/reveal';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams.redirect === 'string' ? searchParams.redirect : '/admin';

  const user = await getCurrentUser();
  if (user?.profile?.role === 'admin') redirect('/admin');

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-brand-950">Admin sign in</h1>
          <p className="mt-1 text-sm text-brand-500">Restricted to DheySa staff.</p>
          <div className="mt-6">
            <AdminLoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </Reveal>
    </main>
  );
}
