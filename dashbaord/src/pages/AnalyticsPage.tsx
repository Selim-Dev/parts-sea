import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import type { Order, Part, OrderStatus } from '../types/index';
import KPICard from '../components/KPICard';
import RecentOrdersList from '../components/RecentOrdersList';
import LowStockAlerts from '../components/LowStockAlerts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  approved: 'معتمد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  delivered: 'تم التسليم',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
  preparing: 'bg-indigo-500',
  ready: 'bg-green-500',
  delivered: 'bg-gray-400',
};

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalParts: number;
  statusBreakdown: Record<OrderStatus, number>;
}

interface TopSellingPart {
  partNumber: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface CategoryStats {
  category: string;
  count: number;
  totalStock: number;
}

export default function AnalyticsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [topParts, setTopParts] = useState<TopSellingPart[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryStats[]>([]);
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, topSellingRes, categoriesRes, lowStockRes, ordersRes] = await Promise.all([
        client.get('/analytics/dashboard'),
        client.get('/analytics/top-selling', { params: { limit: 5 } }),
        client.get('/analytics/categories'),
        client.get('/analytics/low-stock', { params: { threshold: 10 } }),
        client.get('/orders/all'),
      ]);
      
      setDashboardData(dashboardRes.data);
      setTopParts(topSellingRes.data);
      setCategoryBreakdown(categoriesRes.data);
      setLowStockParts(lowStockRes.data);
      setRecentOrders(ordersRes.data);
    } catch {
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (!dashboardData || dashboardData.totalOrders === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
          </svg>
        }
        message="لا توجد بيانات لعرضها حالياً"
      />
    );
  }

  // Status bar max for proportional rendering
  const statusMax = Math.max(...Object.values(dashboardData.statusBreakdown), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="إجمالي الطلبات"
          value={String(dashboardData.totalOrders)}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          }
        />
        <KPICard
          title="طلبات قيد الانتظار"
          value={String(dashboardData.pendingOrders)}
          color="amber"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <KPICard
          title="إجمالي الإيرادات"
          value={`${dashboardData.totalRevenue.toFixed(2)} ر.س`}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <KPICard
          title="إجمالي القطع"
          value={String(dashboardData.totalParts)}
          color="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          }
        />
      </div>

      {/* Status bars + Recent Orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status visual breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">توزيع حالات الطلبات</h3>
          <div className="space-y-3">
            {(Object.entries(dashboardData.statusBreakdown) as [OrderStatus, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">{STATUS_LABELS[status]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status]}`}
                    style={{ width: `${(count / statusMax) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <RecentOrdersList orders={recentOrders} />
      </div>

      {/* Top selling parts + Category breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top selling parts */}
        {topParts.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">القطع الأكثر طلباً</h3>
            <div className="space-y-3">
              {topParts.map((p, idx) => (
                <div key={p.partNumber} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.partNumber}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-semibold text-gray-700">{p.totalQuantity} قطعة</p>
                    <p className="text-xs text-gray-400">{p.totalRevenue.toFixed(0)} ر.س</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">التصنيفات</h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between py-1.5">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                    {cat.category || 'بدون تصنيف'}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{cat.count} قطعة</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500">مخزون: {cat.totalStock}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      <LowStockAlerts parts={lowStockParts} />
    </div>
  );
}
