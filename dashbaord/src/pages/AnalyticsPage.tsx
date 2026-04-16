import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import type { Order, Part, OrderStatus } from '../types/index';
import KPICard from '../components/KPICard';
import RecentOrdersList from '../components/RecentOrdersList';
import LowStockAlerts from '../components/LowStockAlerts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  approved: 'معتمد',
  preparing: 'قيد التحضير',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
  preparing: 'bg-indigo-500',
  ready: 'bg-green-500',
  delivered: 'bg-gray-400',
  cancelled: 'bg-red-400',
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

  if (!dashboardData) {
    return <ErrorState message="حدث خطأ في تحميل البيانات" onRetry={fetchData} />;
  }

  const hasOrders = dashboardData.totalOrders > 0;

  // Status bar max for proportional rendering
  const statusMax = Math.max(...Object.values(dashboardData.statusBreakdown), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner for new users */}
      {!hasOrders && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم! 👋</h1>
            <p className="text-blue-100 mb-6">ابدأ بإضافة طلبات جديدة أو إدارة قطع الغيار المتوفرة</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/orders"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                إنشاء طلب جديد
              </a>
              <a
                href="/parts"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                إدارة قطع الغيار
              </a>
            </div>
          </div>
        </div>
      )}

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

      {/* Status bars + Recent Orders OR Getting Started */}
      {hasOrders ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Getting Started Cards */}
          <div className="group rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 transition hover:border-blue-300 hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">إنشاء طلب</h3>
            <p className="mb-4 text-sm text-gray-600">ابدأ بإنشاء أول طلب لقطع الغيار</p>
            <a href="/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              إنشاء الآن ←
            </a>
          </div>

          <div className="group rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 transition hover:border-green-300 hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">إدارة المخزون</h3>
            <p className="mb-4 text-sm text-gray-600">أضف أو عدّل قطع الغيار المتوفرة</p>
            <a href="/parts" className="text-sm font-semibold text-green-600 hover:text-green-700">
              إدارة القطع ←
            </a>
          </div>

          <div className="group rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 transition hover:border-purple-300 hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">إدارة المحلات</h3>
            <p className="mb-4 text-sm text-gray-600">أضف محلات جديدة أو عدّل بياناتها</p>
            <a href="/shops" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
              إدارة المحلات ←
            </a>
          </div>
        </div>
      )}

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
