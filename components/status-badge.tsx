const STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-brand-100 text-brand-700',
  paid: 'bg-emerald-50 text-emerald-700',
  refunded: 'bg-brand-100 text-brand-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status] ?? 'bg-brand-100 text-brand-700'}`}>
      {status}
    </span>
  );
}
