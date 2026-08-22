function scoreLabel(score10: number): string {
  if (score10 >= 9) return 'Exceptional';
  if (score10 >= 8) return 'Excellent';
  if (score10 >= 7) return 'Very good';
  if (score10 >= 6) return 'Good';
  return 'Fair';
}

export function ScoreBadge({
  avgRating,
  reviewCount,
  size = 'sm',
}: {
  avgRating: number;
  reviewCount: number;
  size?: 'sm' | 'lg';
}) {
  const score10 = Math.round(avgRating * 2 * 10) / 10;
  const boxCls = size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg bg-brand-700 font-bold text-white ${boxCls}`}
      >
        {score10.toFixed(1)}
      </span>
      <div className="text-xs leading-tight">
        <p className="font-semibold text-brand-900">{scoreLabel(score10)}</p>
        <p className="text-brand-400">
          {reviewCount} review{reviewCount === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
