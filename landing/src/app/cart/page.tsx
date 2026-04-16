'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import OrderConfirmationDialog from '@/components/OrderConfirmationDialog';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const cartTotal = items.reduce((sum, item) => sum + item.part.price * item.quantity, 0);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmitOrder = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (items.length === 0) { setErrorMessage('السلة فارغة'); return; }

    setSubmitting(true);
    try {
      const payload = { items: items.map((item) => ({ partId: String(item.part.id), quantity: item.quantity })) };
      const { data } = await api.post('/orders', payload);
      clearCart();
      setSuccessMessage(`تم إرسال الطلب بنجاح — رقم الطلب: ${data.orderNumber}`);
    } catch {
      setErrorMessage('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">سلة الطلب</h1>
              {items.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{items.length} قطعة · {totalUnits} وحدة</p>
              )}
            </div>
            {items.length > 0 && (
              <Link href="/catalog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 font-medium">
                متابعة التسوق
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </Link>
            )}
          </div>

          {/* Success */}
          {successMessage && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              {successMessage}
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              </div>
              {errorMessage}
            </div>
          )}

          {items.length === 0 && !successMessage ? (
            <div className="text-center py-24">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-gray-800 text-lg font-bold mb-1">السلة فارغة</p>
              <p className="text-gray-400 text-sm mb-5">لم تقم بإضافة أي قطع بعد</p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                تصفح الكتالوج
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </Link>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.part.id} className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-6 flex gap-4 hover:shadow-lg hover:shadow-slate-900/[0.06] hover:border-slate-300 transition-all">
                    {/* Part info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-base truncate">{item.part.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">{item.part.partNumber}</span>
                            {item.part.brand && (
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">{item.part.brand}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.part.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-5">
                        {/* Quantity */}
                        <div className="flex items-center gap-0 bg-gray-50 rounded-xl border border-gray-200/80">
                          <button
                            onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-r-xl transition-colors cursor-pointer text-xl font-semibold active:scale-95"
                          >−</button>
                          <span className="w-14 text-center font-bold text-gray-900 text-base tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                            className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-l-xl transition-colors cursor-pointer text-xl font-semibold active:scale-95"
                          >+</button>
                        </div>

                        {/* Price */}
                        <div className="text-left">
                          <span className="text-xl font-extrabold text-gray-900">{(item.part.price * item.quantity).toFixed(2)}</span>
                          <span className="text-sm text-gray-400 mr-1">ر.س</span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.part.price.toFixed(2)} × {item.quantity}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-[88px] bg-white rounded-2xl border border-gray-200/60 p-6 space-y-5 shadow-md">
                  <h2 className="text-lg font-bold text-gray-900">ملخص الطلب</h2>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>عدد القطع</span>
                      <span className="font-semibold text-gray-700">{items.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>إجمالي الكميات</span>
                      <span className="font-semibold text-gray-700">{totalUnits} وحدة</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-semibold text-gray-500">الإجمالي</span>
                      <div>
                        <span className="text-2xl font-extrabold text-gray-900">{cartTotal.toFixed(0)}</span>
                        <span className="text-sm font-medium text-gray-400 mr-1">.{(cartTotal % 1).toFixed(2).slice(2)} ر.س</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={submitting}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 text-white font-semibold rounded-2xl transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-slate-900/25"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      <>
                        إرسال الطلب
                        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <OrderConfirmationDialog
            isOpen={showConfirmDialog}
            totalAmount={cartTotal}
            itemCount={totalUnits}
            onConfirm={() => { setShowConfirmDialog(false); handleSubmitOrder(); }}
            onCancel={() => setShowConfirmDialog(false)}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
