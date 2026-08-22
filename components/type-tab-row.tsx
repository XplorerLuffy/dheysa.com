import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export type TypeTabItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
};

export function TypeTabRow({ items, tone = 'light' }: { items: TypeTabItem[]; tone?: 'light' | 'dark' }) {
  const wrapCls =
    tone === 'dark'
      ? 'inline-flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1 backdrop-blur'
      : 'inline-flex gap-1 rounded-2xl border border-brand-950/5 bg-brand-50 p-1';

  return (
    <div className={wrapCls}>
      {items.map((item) => {
        const content = (
          <>
            <item.icon size={16} />
            {item.label}
            {item.disabled && (
              <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                Soon
              </span>
            )}
          </>
        );

        const activeCls =
          tone === 'dark'
            ? 'bg-white text-brand-900 shadow-sm'
            : 'bg-white text-brand-900 shadow-sm';
        const inactiveCls =
          tone === 'dark' ? 'text-white/70 hover:text-white' : 'text-brand-500 hover:text-brand-700';
        const disabledCls = tone === 'dark' ? 'text-white/30' : 'text-brand-300';

        const cls = `flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          item.disabled ? `${disabledCls} cursor-not-allowed` : item.active ? activeCls : inactiveCls
        }`;

        if (item.disabled) {
          return (
            <span key={item.label} className={cls}>
              {content}
            </span>
          );
        }

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={cls}>
              {content}
            </Link>
          );
        }

        return (
          <button key={item.label} type="button" onClick={item.onClick} className={cls}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
