'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  cancelled: 'ملغي',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
  approved: 'bg-blue-50 text-blue-700 border-blue-200/80',
  preparing: 'bg-violet-50 text-violet-700 border-violet-200/80',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  delivered: 'bg-gray-50 text-gray-500 border-gray-200/80',
  cancelled: 'bg-red-50 text-red-600 border-red-200/80',
};

const statusDots: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
  preparing: 'bg-violet-500',
  ready: 'bg-emerald-500',
  delivered: 'bg-gray-400',
  cancelled: 'bg-red-400',
};

const allStatuses: (OrderStatus | 'all')[] = ['all', 'pending', 'approved', 'preparing', 'ready', 'delivered', 'cancelled'];

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch { /* silently handle */ } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
              <p className="text-sm text-gray-500 mt-1">تتبع حالة طلباتك</p>
            </div>
            {orders.length > 0 && (
              <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/25">
                {orders.length} طلب
              </div>
            )}
          </div>

          {/* Status filter tabs */}
          {orders.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {allStatuses.map((status) => {
                const count = status === 'all' ? orders.length : (statusCounts[status] || 0);
                const isActive = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`shrink-0 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                        : 'bg-white border border-gray-200/80 text-gray-600 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {status !== 'all' && (
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : statusDots[status]}`} />
                    )}
                    {status === 'all' ? 'الكل' : statusLabels[status]}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-slate-900 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-gray-400">جاري التحميل...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <p className="text-gray-800 text-lg font-bold mb-1">لا توجد طلبات بعد</p>
              <p className="text-gray-400 text-sm mb-5">ابدأ بتصفح الكتالوج وأضف قطع الغيار لسلتك</p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                تصفح الكتالوج
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">لا توجد طلبات بهذه الحالة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="w-full bg-white rounded-2xl border border-gray-200/60 p-6 text-start hover:shadow-xl hover:shadow-slate-900/[0.08] hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Status dot */}
                      <div className={`shrink-0 w-3 h-3 rounded-full ${statusDots[order.status]} ring-4 ring-white shadow-md`} />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-base">{order.orderNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatArabicDate(order.createdAt)}</span>
                          {order.items && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span>{order.items.length} قطعة</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-slate-900 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
