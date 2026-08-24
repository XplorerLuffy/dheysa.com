'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { GMC_DESTINATIONS } from '@/lib/destinations';

// Renders its dropdown via a portal into document.body, positioned with
// fixed coordinates from the input's bounding rect. Both places this is
// used (the pill search bar, the browse-page search bar) clip overflow
// on an ancestor for their rounded-corner shape, so an absolutely
// positioned dropdown nested inside would get cut off — a portal sidesteps
// that entirely regardless of ancestor overflow/rounding.
export function DestinationAutocomplete({
  value,
  onChange,
  placeholder,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function updateRect() {
      if (!inputRef.current) return;
      const r = inputRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + 8, left: r.left, width: Math.max(r.width, 224) });
    }
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (inputRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const matches = GMC_DESTINATIONS.filter((d) => d.toLowerCase().includes(value.trim().toLowerCase()));

  return (
    <>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      {mounted &&
        open &&
        rect &&
        matches.length > 0 &&
        createPortal(
          <ul
            ref={dropdownRef}
            style={{ top: rect.top, left: rect.left, width: rect.width }}
            className="fixed z-50 overflow-hidden rounded-2xl border border-brand-950/5 bg-white py-1.5 text-left shadow-lift"
          >
            {matches.map((d) => (
              <li key={d}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-brand-700 hover:bg-brand-50"
                >
                  <MapPin size={14} className="shrink-0 text-brand-400" />
                  {d}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
