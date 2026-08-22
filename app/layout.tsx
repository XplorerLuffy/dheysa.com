import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'DheySa — Curated stays & experiences in Gelephu Mindfulness City',
  description:
    'A curated booking marketplace for hotels, homestays, tours, and transport in Gelephu Mindfulness City, Bhutan.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-brand-900 antialiased">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
