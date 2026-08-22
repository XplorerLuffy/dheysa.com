export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-xl' : 'text-sm';
  return (
    <span className={`${cls} text-amber-500`} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-brand-200">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}
