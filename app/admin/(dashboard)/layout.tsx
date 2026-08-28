import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin-sidebar';

// Middleware already guards every /admin/* route; this re-check exists so
// the dashboard cannot render for a non-admin even if middleware is ever
// bypassed or misconfigured.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (user.profile?.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <AdminSidebar name={user.profile?.full_name ?? user.email ?? 'Admin'} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
