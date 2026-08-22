'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

// Wraps the hero: on mount, staggers in the direct children (badge,
// heading, subtext, search card — each should carry data-hero-item), and
// gives the two ambient glow blobs a slow "breathing" pulse — a deliberate
// nod to the mindfulness theme rather than a generic decorative loop.
export function HeroIntro({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) return;

      const items = ref.current.querySelectorAll('[data-hero-item]');
      if (items.length) {
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
      }

      const glows = ref.current.querySelectorAll('[data-hero-glow]');
      glows.forEach((glow, i) => {
        gsap.to(glow, {
          scale: 1.15,
          opacity: 0.85,
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
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
