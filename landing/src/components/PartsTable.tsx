'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  PackageX,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatStockDisplay } from '@/utils/catalog';

import type { CartItem, Part } from '@/types/index';

interface PartsTableProps {
  parts: Part[];
  cartItems: CartItem[];
  onAddToCart: (part: Part) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
  onSelect: (part: Part) => void;
}

const columnHelper = createColumnHelper<Part>();

const AVATAR_PALETTE = [
  'from-blue-500 to-indigo-600',
  'from-indigo-500 to-violet-600',
  'from-violet-500 to-fuchsia-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-slate-700 to-slate-900',
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(part: Part): string {
  const cleaned = part.partNumber.replace(/[^A-Za-z0-9؀-ۿ]/g, '');
  if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase();
  const fromName = part.name.replace(/\s+/g, '').slice(0, 2);
  return (cleaned + fromName).slice(0, 2).toUpperCase();
}

function getAvatarGradient(part: Part): string {
  return AVATAR_PALETTE[hashString(part.partNumber || part.id) % AVATAR_PALETTE.length];
}

function SortIndicator({ direction }: { direction: 'asc' | 'desc' | false }) {
  return (
    <span className="inline-flex flex-col -space-y-[3px] mr-1">
      <ChevronUp
        className={`w-3 h-3 transition-all duration-200 ${
          direction === 'asc'
            ? 'text-slate-900 scale-110'
            : 'text-slate-300 group-hover/sort:text-slate-500'
        }`}
        strokeWidth={3}
      />
      <ChevronDown
        className={`w-3 h-3 transition-all duration-200 ${
          direction === 'desc'
            ? 'text-slate-900 scale-110'
            : 'text-slate-300 group-hover/sort:text-slate-500'
        }`}
        strokeWidth={3}
      />
    </span>
  );
}

function Avatar({ part }: { part: Part }) {
  const gradient = getAvatarGradient(part);
  const initials = getInitials(part);
  return (
    <div
      className={`relative w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-slate-900/15 ring-1 ring-white/30`}
      style={{ direction: 'ltr' }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
      <span className="relative tracking-tight">{initials}</span>
    </div>
  );
}

function PriceCell({ price }: { price: number }) {
  const whole = Math.floor(price);
  const fraction = (price % 1).toFixed(2).slice(2);
  return (
    <div
      className="inline-flex items-baseline gap-1 whitespace-nowrap"
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      <span className="text-lg font-extrabold text-slate-900 tabular-nums tracking-tight">
        {whole}
        <span className="text-slate-400 text-sm font-bold">.{fraction}</span>
      </span>
      <span className="text-[11px] font-semibold text-slate-500 tracking-wide">ر.س</span>
    </div>
  );
}

function StockPill({ stock }: { stock: number }) {
  const display = formatStockDisplay(stock);
  const styles =
    display.color === 'green'
      ? {
          wrap: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200/60',
          dot: 'bg-emerald-500',
          pulse: false,
        }
      : display.color === 'amber'
      ? {
          wrap: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200/60',
          dot: 'bg-amber-500',
          pulse: true,
        }
      : {
          wrap: 'text-rose-600 bg-rose-50 ring-1 ring-rose-200/60',
          dot: 'bg-rose-500',
          pulse: false,
        };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap ${styles.wrap}`}
    >
      <span className="relative flex w-1.5 h-1.5">
        {styles.pulse && (
          <span className={`absolute inset-0 rounded-full ${styles.dot} opacity-60 animate-ping`} />
        )}
        <span className={`relative w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      </span>
      {stock > 0 ? (
        <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }} className="tabular-nums">
          {stock} متوفر
        </span>
      ) : (
        'نفذ المخزون'
      )}
    </span>
  );
}

export default function PartsTable({
  parts,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onSelect,
}: PartsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const cartQtyById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) map.set(item.part.id, item.quantity);
    return map;
  }, [cartItems]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'القطعة',
        enableSorting: true,
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name, 'ar'),
        cell: (info) => {
          const part = info.row.original;
          return (
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar part={part} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 leading-snug truncate">
                  {part.name}
                </div>
                {part.description && (
                  <div className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">
                    {part.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('partNumber', {
        header: 'رقم القطعة',
        enableSorting: true,
        cell: (info) => (
          <span
            className="inline-block font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md tracking-tight border border-slate-200/70"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'التصنيف',
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-slate-300 text-sm">—</span>;
          return (
            <span className="inline-block text-[11px] text-blue-700 bg-blue-50 font-bold tracking-wide px-2.5 py-1.5 rounded-lg whitespace-nowrap ring-1 ring-blue-100">
              {value}
            </span>
          );
        },
      }),
      columnHelper.accessor('brand', {
        header: 'الماركة',
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-slate-300 text-sm">—</span>;
          return (
            <span className="inline-block bg-white text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 whitespace-nowrap shadow-sm">
              {value}
            </span>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'السعر',
        enableSorting: true,
        cell: (info) => <PriceCell price={info.getValue()} />,
      }),
      columnHelper.accessor('stock', {
        header: 'المخزون',
        enableSorting: true,
        cell: (info) => <StockPill stock={info.row.original.stock} />,
      }),
      columnHelper.display({
        id: 'action',
        header: () => <span className="sr-only">الإجراء</span>,
        cell: (info) => {
          const part = info.row.original;
          const cartQty = cartQtyById.get(part.id) ?? 0;

          if (part.stock === 0) {
            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-400 text-[11px] font-bold ring-1 ring-slate-200 whitespace-nowrap">
                <PackageX className="w-3.5 h-3.5" strokeWidth={2.5} />
                نفذ
              </span>
            );
          }

          if (cartQty > 0) {
            return (
              <div
                className="inline-flex items-center gap-1.5 bg-white rounded-xl ring-1 ring-emerald-200 shadow-sm shadow-emerald-100/60 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onUpdateQuantity(part.id, cartQty - 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-700 text-base font-bold transition-all cursor-pointer active:scale-90"
                  aria-label="إنقاص الكمية"
                >
                  −
                </button>
                <span
                  className="min-w-[1.75rem] text-center font-extrabold text-slate-900 text-sm tabular-nums px-1"
                  style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                >
                  {cartQty}
                </span>
                <button
                  onClick={() => onUpdateQuantity(part.id, cartQty + 1)}
                  disabled={cartQty >= part.stock}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 flex items-center justify-center text-white text-base font-bold transition-all cursor-pointer active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-slate-900/30"
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>
            );
          }

          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(part);
              }}
              className="group/btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-br from-slate-900 to-slate-800 hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap shadow-sm shadow-slate-900/30"
            >
              <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-90" strokeWidth={3} />
              أضف للسلة
            </button>
          );
        },
      }),
    ],
    [cartQtyById, onAddToCart, onUpdateQuantity],
  );

  const table = useReactTable({
    data: parts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-px shadow-xl shadow-slate-900/[0.05]">
      <div className="relative rounded-[calc(1.5rem-1px)] bg-white overflow-hidden">
        {/* Top accent gradient line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[860px] text-right border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx) => {
                    const canSort = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    const isFirst = idx === 0;
                    const isLast = idx === headerGroup.headers.length - 1;
                    return (
                      <th
                        key={header.id}
                        className={`px-4 py-4 text-[11px] font-extrabold text-slate-600 uppercase tracking-[0.08em] bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 ${
                          isFirst ? 'pr-6' : ''
                        } ${isLast ? 'pl-6' : ''} ${
                          canSort
                            ? 'cursor-pointer select-none group/sort hover:text-slate-900 transition-colors'
                            : ''
                        }`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIndicator direction={sortDir} />}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIdx) => {
                const part = row.original;
                const cartQty = cartQtyById.get(part.id) ?? 0;
                const inCart = cartQty > 0;
                const isLastRow = rowIdx === table.getRowModel().rows.length - 1;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelect(part)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(part);
                      }
                    }}
                    tabIndex={0}
                    className={`group cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-inset ${
                      inCart
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                        : 'hover:bg-gradient-to-l hover:from-blue-50/40 hover:via-white hover:to-blue-50/40'
                    }`}
                  >
                    {row.getVisibleCells().map((cell, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === row.getVisibleCells().length - 1;
                      return (
                        <td
                          key={cell.id}
                          className={`px-4 py-4 align-middle ${
                            isLastRow ? '' : 'border-b border-slate-100'
                          } ${isFirst ? 'pr-6' : ''} ${isLast ? 'pl-6 text-left' : ''} ${
                            inCart && isFirst ? 'border-r-[3px] border-r-emerald-500' : ''
                          }`}
                        >
                          {isLast ? (
                            <div className="flex items-center justify-end gap-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              <ChevronLeft
                                className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-all duration-200"
                                strokeWidth={2.5}
                              />
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gradient-to-r from-slate-50/60 via-white to-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
            <span>اضغط على الصف لعرض التفاصيل</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 shadow-sm">↑↓</kbd>
            <span>للترتيب</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PartsTableSkeleton() {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 p-px shadow-xl shadow-slate-900/[0.05]">
      <div className="rounded-[calc(1.5rem-1px)] bg-white overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr>
                {['القطعة', 'رقم القطعة', 'التصنيف', 'الماركة', 'السعر', 'المخزون', ''].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 py-4 text-[11px] font-extrabold text-slate-600 uppercase tracking-[0.08em] bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 text-right"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 border-b border-slate-100 pr-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200/80 rounded animate-pulse w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-4 border-b border-slate-100">
                      <div
                        className="h-6 bg-slate-100 rounded-lg animate-pulse"
                        style={{ width: j === 0 ? '5rem' : j === 3 ? '4.5rem' : '4rem' }}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-4 border-b border-slate-100 pl-6">
                    <div className="h-9 w-24 bg-slate-200/80 rounded-xl animate-pulse ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
