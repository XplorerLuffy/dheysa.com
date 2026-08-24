import type { LucideIcon } from 'lucide-react';

export function FormField({
  icon: Icon,
  label,
  children,
  className = '',
  overflowVisible = false,
}: {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
  // Lets content (e.g. an autocomplete dropdown) escape the field's
  // bounds instead of being clipped. Off by default since most fields
  // (dates, guest counts) rely on overflow-hidden to keep their text tidy.
  overflowVisible?: boolean;
}) {
  return (
    <div
      className={`relative flex items-center gap-2.5 rounded-2xl border border-brand-950/5 bg-brand-50/60 px-3.5 py-2.5 transition focus-within:border-brand-300 focus-within:bg-white ${className}`}
    >
      {Icon && <Icon size={17} className="shrink-0 text-brand-400" />}
      <div className={`flex-1 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
        <p className="text-[11px] font-medium text-brand-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
