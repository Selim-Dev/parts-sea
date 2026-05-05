'use client';

import CartIndicatorBadge from '@/components/CartIndicatorBadge';
import { formatStockDisplay, getCartQuantityForPart } from '@/utils/catalog';

import type { CartItem, Part } from '@/types/index';

interface PartsCardGridProps {
  parts: Part[];
  cartItems: CartItem[];
  onAddToCart: (part: Part) => void;
  onUpdateQuantity: (partId: string, quantity: number) => void;
  onSelect: (part: Part) => void;
}

export default function PartsCardGrid({
  parts,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onSelect,
}: PartsCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {parts.map((part) => {
        const cartQty = getCartQuantityForPart(cartItems, part.id);
        const stockDisplay = formatStockDisplay(part.stock);
        return (
          <div
            key={part.id}
            className={`group relative bg-white rounded-2xl border overflow-hidden hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
              cartQty > 0
                ? 'border-emerald-300 shadow-md shadow-emerald-100 ring-1 ring-emerald-200'
                : 'border-gray-200/60 hover:border-slate-300'
            }`}
            onClick={() => onSelect(part)}
          >
            <CartIndicatorBadge quantity={cartQty} />

            <div className="p-5">
              {part.category && (
                <span className="inline-block text-[11px] text-blue-600 bg-blue-50 font-semibold tracking-wide px-2.5 py-1 rounded-lg mb-2">{part.category}</span>
              )}

              <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-slate-900 transition-colors min-h-[3rem]">
                {part.name}
              </h3>

              <p className="text-xs font-mono text-gray-400 mb-3 tracking-tight">{part.partNumber}</p>

              {part.brand && (
                <div className="inline-block bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 border border-slate-200/60">
                  {part.brand}
                </div>
              )}

              {part.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{part.description}</p>
              )}

              <div className="flex items-end justify-between gap-2 mb-4 pt-2 border-t border-gray-100">
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">{part.price.toFixed(0)}</span>
                  <span className="text-sm font-medium text-gray-400 mr-1">.{(part.price % 1).toFixed(2).slice(2)} ر.س</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  stockDisplay.color === 'green' ? 'text-emerald-700 bg-emerald-50' :
                  stockDisplay.color === 'amber' ? 'text-amber-700 bg-amber-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {part.stock > 0 ? `${part.stock} متوفر` : 'نفذ'}
                </span>
              </div>

              {part.stock === 0 ? (
                <div className="bg-gray-50 text-gray-400 text-xs font-bold px-4 py-3 rounded-xl text-center border border-gray-200">
                  نفذ المخزون
                </div>
              ) : cartQty > 0 ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      في السلة
                    </span>
                    <span className="text-xs font-bold text-slate-700">{(part.price * cartQty).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(part.id, cartQty - 1)}
                      className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-600 text-lg font-bold transition-all cursor-pointer active:scale-95"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-extrabold text-slate-900 text-lg tabular-nums">{cartQty}</span>
                    <button
                      onClick={() => onUpdateQuantity(part.id, cartQty + 1)}
                      disabled={cartQty >= part.stock}
                      className="w-11 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white text-lg font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(part); }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.97]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  أضف للسلة
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
