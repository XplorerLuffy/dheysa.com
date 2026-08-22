import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getCurrentUser } from '@/lib/auth';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DheySa — Curated stays & experiences in Gelephu Mindfulness City',
  description:
    'A curated booking marketplace for hotels, homestays, tours, and transport in Gelephu Mindfulness City, Bhutan.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-brand-950 antialiased">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
