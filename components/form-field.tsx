import type { LucideIcon } from 'lucide-react';

export function FormField({
  icon: Icon,
  label,
  children,
  className = '',
}: {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border border-brand-950/5 bg-brand-50/60 px-3.5 py-2.5 transition focus-within:border-brand-300 focus-within:bg-white ${className}`}
    >
      {Icon && <Icon size={17} className="shrink-0 text-brand-400" />}
      <div className="flex-1 overflow-hidden">
        <p className="text-[11px] font-medium text-brand-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
