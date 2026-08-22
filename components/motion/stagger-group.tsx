'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

// Reveals a grid/list's direct children as a gentle staggered wave when the
// group scrolls into view — used for listing cards and result rows.
// `watch` should change (e.g. a list of ids joined into a string) whenever
// the children are swapped out (new search results) so it re-triggers.
export function StaggerGroup({
  children,
  className,
  watch,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  watch?: string | number;
  as?: 'div' | 'ul';
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const items = Array.from(ref.current.children);
      if (!items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        // Once the reveal finishes, hand the elements' opacity/transform
        // back to plain CSS — several cards use Tailwind's `transition`
        // utility for hover states, and leaving GSAP's inline styles in
        // place makes that CSS transition fight GSAP's own writes on the
        // same properties (each GSAP tick re-triggers it), which can
        // leave the element visually stuck instead of settling.
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: ref, dependencies: [watch] }
  );

  return (
    <Tag ref={ref as React.Ref<any>} className={className}>
      {children}
    </Tag>
  );
}
