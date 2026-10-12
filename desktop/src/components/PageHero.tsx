import type { ReactNode } from 'react';

/** Big editorial page header — eyebrow + display title + description + optional right-side actions. */
export default function PageHero({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow: string;
  title: ReactNode;
  desc: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-dark-50 mt-1.5">{title}</h1>
        <p className="text-sm text-dark-200 mt-2 max-w-2xl leading-relaxed">{desc}</p>
      </div>
      {right && <div className="shrink-0 flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}
