import { formatDate } from '@/lib/format';
import type { AvailabilityDay } from '@/lib/data/listings';

export function AvailabilityPreview({ days }: { days: AvailabilityDay[] }) {
  const available = days.filter((d) => d.slots_available > 0);

  if (available.length === 0) {
    return (
      <p className="text-sm text-brand-500">
        No open dates in the next 60 days yet — check back soon or contact us for other dates.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.slice(0, 12).map((day) => (
        <span
          key={day.date}
          className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
        >
          {formatDate(day.date)}
        </span>
      ))}
      {available.length > 12 && (
        <span className="rounded-full px-3 py-1 text-xs text-brand-400">
          +{available.length - 12} more open dates
        </span>
      )}
    </div>
  );
}
