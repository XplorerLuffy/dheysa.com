'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

// Wraps the hero: on mount, staggers in the direct children (heading,
// subtext, search bar — each should carry data-hero-item).
export function HeroIntro({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) return;

      const items = ref.current.querySelectorAll('[data-hero-item]');
      if (!items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 22,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.12,
        // See StaggerGroup for why: the search bar's buttons use CSS
        // transition/hover utilities that would otherwise fight GSAP's
        // inline styles after this one-time entrance finishes.
        clearProps: 'opacity,transform',
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
