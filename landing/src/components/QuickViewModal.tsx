'use client';

import { useEffect } from 'react';

import type { Part } from '@/types/index';

interface QuickViewModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (part: Part) => void;
  cartQuantity: number;
}

export default function QuickViewModal({
  part,
  isOpen,
  onClose,
  onAddToCart,
  cartQuantity,
}: QuickViewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !part) return null;

  const outOfStock = part.stock === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-8">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all cursor-pointer"
            aria-label="إغلاق"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {part.brand && (
            <div className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg mb-3">
              {part.brand}
            </div>
          )}

          {part.category && (
            <span className="text-[11px] text-blue-300 font-semibold tracking-wide mb-2 block">{part.category}</span>
          )}

          <h2 className="text-2xl font-bold text-white leading-snug mb-2">{part.name}</h2>
          <span className="text-[11px] font-mono bg-white/10 text-white/70 px-2.5 py-1 rounded-lg inline-block">{part.partNumber}</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-end gap-3">
            <div>
              <span className="text-3xl font-extrabold text-gray-900">{part.price.toFixed(0)}</span>
              <span className="text-sm font-medium text-gray-400 mr-0.5">.{(part.price % 1).toFixed(2).slice(2)} ر.س</span>
            </div>
            <span className={`text-sm font-medium pb-0.5 ${outOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
              {outOfStock ? 'نفذ المخزون' : `${part.stock} متوفر`}
            </span>
          </div>

          {part.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{part.description}</p>
          )}

          {cartQuantity > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-sm text-slate-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>في السلة: <strong className="text-slate-900">{cartQuantity}</strong></span>
            </div>
          )}

          <button
            onClick={() => onAddToCart(part)}
            disabled={outOfStock}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-2xl transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {outOfStock ? (
              'نفذ المخزون'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                أضف للسلة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
