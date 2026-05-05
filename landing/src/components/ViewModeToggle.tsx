'use client';

import { LayoutGrid, Table as TableIcon } from 'lucide-react';

export type CatalogView = 'table' | 'cards';

interface ViewModeToggleProps {
  view: CatalogView;
  onChange: (view: CatalogView) => void;
}

const ITEMS: { value: CatalogView; label: string; Icon: typeof TableIcon }[] = [
  { value: 'table', label: 'جدول', Icon: TableIcon },
  { value: 'cards', label: 'بطاقات', Icon: LayoutGrid },
];

export default function ViewModeToggle({ view, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="relative inline-flex items-center bg-white border border-slate-200/80 rounded-xl p-1 shadow-sm"
      role="radiogroup"
      aria-label="نمط العرض"
    >
      {ITEMS.map(({ value, label, Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md shadow-slate-900/25'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
