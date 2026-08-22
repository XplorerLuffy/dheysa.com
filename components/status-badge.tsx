const STYLES: Record<string, string> = {
  pending: 'bg-accent-50 text-accent-700',
  confirmed: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-brand-100 text-brand-800',
  paid: 'bg-brand-50 text-brand-700',
  refunded: 'bg-brand-100 text-brand-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status] ?? 'bg-brand-100 text-brand-700'}`}
    >
      {status}
    </span>
  );
}
