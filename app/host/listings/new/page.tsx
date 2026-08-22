import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NewListingWizard } from '@/components/new-listing-wizard';
import { Reveal } from '@/components/motion/reveal';

async function getMyHostId(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('hosts').select('id').eq('user_id', userId).maybeSingle();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/host/listings/new');

  const hostId = await getMyHostId(user.id);

  if (!hostId) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <Reveal>
          <h1 className="text-2xl font-bold text-brand-950">No host application found</h1>
          <p className="mt-2 text-brand-600">
            Create a host account first — our team will follow up, and you can add your first listing
            right after.
          </p>
          <Link
            href="/host-signup"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-900"
          >
            Create a host account
            <ArrowRight size={14} />
          </Link>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Reveal className="w-full">
        <div className="rounded-3xl border border-brand-950/5 p-8 shadow-soft">
          <NewListingWizard />
        </div>
      </Reveal>
    </main>
  );
}
