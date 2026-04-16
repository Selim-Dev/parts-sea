import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { filterOrdersBySearch, computeOrderTotal, computeStatusBreakdown } from '../utils/analytics';
import type { Order, OrderStatus } from '../types/index';

const statusFilters: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'قيد الانتظار', value: 'pending' },
  { label: 'معتمد', value: 'approved' },
  { label: 'قيد التحضير', value: 'preparing' },
  { label: 'جاهز', value: 'ready' },
  { label: 'تم التسليم', value: 'delivered' },
  { label: 'ملغي', value: 'cancelled' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  async function fetchOrders() {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      const res = await client.get('/orders/all', { params });
      setOrders(res.data);
    } catch {
      setError(true);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const filteredOrders = filterOrdersBySearch(orders, searchText);
  const breakdown = computeStatusBreakdown(orders);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
        <p className="mt-1 text-sm text-gray-500">عرض وإدارة جميع الطلبات</p>
      </div>

      {/* Status summary chips */}
      {!loading && orders.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.entries(breakdown) as [OrderStatus, number][]).map(
            ([status, count]) =>
              count > 0 && (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                  {statusFilters.find((f) => f.value === status)?.label} ({count})
                </span>
              ),
          )}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count = filter.value === 'all'
            ? orders.length
            : (breakdown[filter.value as OrderStatus] ?? 0);
          if (filter.value !== 'all' && count === 0) return null;
          return (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label}
              <span className={`text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 ${
                activeFilter === filter.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="بحث بالرقم أو اسم المحل أو رقم القطعة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          }
          message="لا توجد طلبات"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">رقم الطلب</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">اسم المحل</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">التاريخ</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">القطع</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">الحالة</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-gray-500">الإجمالي</th>
                  <th className="px-3 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="group cursor-pointer border-b border-gray-50 transition-colors even:bg-gray-50/50 hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">
                      {order.user?.shopName || order.user?.username || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        {(order.items ?? []).length} قطعة
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {computeOrderTotal(order.items ?? []).toFixed(2)} ر.س
                    </td>
                    <td className="px-3 py-3.5 text-gray-300 group-hover:text-gray-500 transition-colors">
                      <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
