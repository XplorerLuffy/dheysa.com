import { Star } from 'lucide-react';

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 20 : 14;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={px}
          className={i < rating ? 'fill-accent-400 text-accent-400' : 'fill-brand-100 text-brand-100'}
        />
      ))}
    </span>
  );
}
