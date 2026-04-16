'use client';

import { useEffect } from 'react';

import type { Part } from '@/types/index';

interface QuickViewModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (part: Part) => void;
  onUpdateQuantity?: (partId: string, quantity: number) => void;
  cartQuantity: number;
}

export default function QuickViewModal({
  part,
  isOpen,
  onClose,
  onAddToCart,
  onUpdateQuantity,
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

          {outOfStock ? (
            <div className="w-full py-3.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-2xl text-center">
              نفذ المخزون
            </div>
          ) : cartQuantity > 0 && onUpdateQuantity ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  في السلة
                </span>
                <span className="text-sm font-bold text-slate-700">{(part.price * cartQuantity).toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateQuantity(part.id, cartQuantity - 1)}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-600 text-xl font-bold transition-all cursor-pointer active:scale-95"
                >
                  −
                </button>
                <span className="flex-1 text-center font-extrabold text-slate-900 text-2xl tabular-nums">{cartQuantity}</span>
                <button
                  onClick={() => onUpdateQuantity(part.id, cartQuantity + 1)}
                  disabled={cartQuantity >= part.stock}
                  className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white text-xl font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-3 w-full py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                متابعة التسوق
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(part)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              أضف للسلة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
