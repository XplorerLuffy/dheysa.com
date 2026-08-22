'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'curated', label: 'Curated picks first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
] as const;

export function ResultsSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const sort = searchParams.get('sort') ?? 'curated';

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      value ? params.set(key, value) : params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
  }

  return (
    <aside className="space-y-6 rounded-2xl border border-brand-950/5 bg-white p-5 shadow-soft lg:sticky lg:top-40">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-bold text-brand-950">
          <SlidersHorizontal size={14} />
          Sort by
        </p>
        <div className="mt-2 space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-brand-700">
              <input
                type="radio"
                name="sort"
                checked={sort === opt.value}
                onChange={() => updateParams({ sort: opt.value === 'curated' ? undefined : opt.value })}
                className="h-3.5 w-3.5 accent-brand-700"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handlePriceSubmit} className="border-t border-brand-950/5 pt-5">
        <p className="text-sm font-bold text-brand-950">Your budget per night</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <span className="text-brand-300">—</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-brand-950/10 px-2.5 py-2 text-sm text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          Apply
        </button>
      </form>
    </aside>
  );
}
