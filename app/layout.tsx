import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DheySa — Curated stays & experiences in Gelephu Mindfulness City',
  description:
    'A curated booking marketplace for hotels, homestays, tours, and transport in Gelephu Mindfulness City, Bhutan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-brand-900 antialiased">{children}</body>
    </html>
  );
}
