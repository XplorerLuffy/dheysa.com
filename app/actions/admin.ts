'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Every mutation here is also enforced at the database level
// (enforce_host_verification_rules silently reverts verification_status
// changes from a non-admin, enforce_listing_publish_rules gates status)
// — the role check below exists to fail loudly in the server log instead
// of a silent no-op, not as the actual security boundary. These are
// plain void actions (not wired through useFormState) since the admin
// list re-rendering after revalidatePath is the only feedback needed —
// a failed update just leaves the item in the pending list.
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;

  return supabase;
}

export async function approveHost(hostId: string): Promise<void> {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return;
    await supabase.from('hosts').update({ verification_status: 'verified' }).eq('id', hostId);
  } catch (error) {
    console.error('approveHost failed:', error);
  }
  revalidatePath('/admin/hosts');
}

export async function rejectHost(hostId: string): Promise<void> {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return;
    await supabase.from('hosts').update({ verification_status: 'rejected' }).eq('id', hostId);
  } catch (error) {
    console.error('rejectHost failed:', error);
  }
  revalidatePath('/admin/hosts');
}

export async function approveListing(listingId: string, formData: FormData): Promise<void> {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return;

    const curatedByAdmin = formData.get('curatedByAdmin') === 'true';
    const featured = formData.get('featured') === 'true';

    await supabase
      .from('listings')
      .update({ status: 'published', curated_by_admin: curatedByAdmin, featured })
      .eq('id', listingId);
  } catch (error) {
    console.error('approveListing failed:', error);
  }
  revalidatePath('/admin/listings');
}

// Sends a listing back to the host as a draft rather than archiving it —
// the host can revise it and resubmit (see resubmitListing in
// app/actions/listings.ts) rather than starting over.
export async function rejectListing(listingId: string): Promise<void> {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return;
    await supabase.from('listings').update({ status: 'draft' }).eq('id', listingId);
  } catch (error) {
    console.error('rejectListing failed:', error);
  }
  revalidatePath('/admin/listings');
}
