'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import { Order, OrderStatus } from '@/types/index';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  approved: 'معتمد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  delivered: 'تم التسليم',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusSteps: OrderStatus[] = ['pending', 'approved', 'preparing', 'ready', 'delivered'];

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;
  const orderTotal = order
    ? order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    : 0;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Back link */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            العودة للطلبات
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
                <p className="text-sm text-gray-400">جاري التحميل...</p>
              </div>
            </div>
          ) : error || !order ? (
            <div className="text-center py-20">
              <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">لم يتم العثور على الطلب</p>
            </div>
          ) : (
            <>
              {/* Order header card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-l from-blue-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">رقم الطلب</p>
                      <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm text-blue-200">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {formatArabicDate(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      {order.items.length} قطعة
                    </div>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="p-6">
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-4 right-4 left-4 h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                    {statusSteps.map((step, i) => {
                      const isDone = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={step} className="relative flex flex-col items-center z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                                : isDone
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isDone ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          <span className={`text-[10px] mt-2 font-medium whitespace-nowrap ${
                            isCurrent ? 'text-blue-700' : isDone ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {statusLabels[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">القطع المطلوبة</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 text-gray-500">
                      <tr>
                        <th className="px-5 py-3.5 text-start font-medium text-xs uppercase tracking-wider">رقم القطعة</th>
                        <th className="px-5 py-3.5 text-start font-medium text-xs uppercase tracking-wider">اسم القطعة</th>
                        <th className="px-5 py-3.5 text-center font-medium text-xs uppercase tracking-wider">الكمية</th>
                        <th className="px-5 py-3.5 text-start font-medium text-xs uppercase tracking-wider">سعر الوحدة</th>
                        <th className="px-5 py-3.5 text-start font-medium text-xs uppercase tracking-wider">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-gray-500 bg-gray-50/50">
                            {item.partNumber}
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900">{item.partName}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-700">{item.unitPrice.toFixed(2)} ر.س</td>
                          <td className="px-5 py-4 font-semibold text-gray-900">
                            {(item.unitPrice * item.quantity).toFixed(2)} ر.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/80">
                        <td colSpan={4} className="px-5 py-4 text-start font-bold text-gray-900">
                          الإجمالي
                        </td>
                        <td className="px-5 py-4 font-bold text-blue-700 text-base">
                          {orderTotal.toFixed(2)} ر.س
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
