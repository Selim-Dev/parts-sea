import type { Order } from '../types/index';
import StatusBadge from './StatusBadge';

interface RecentOrdersListProps {
  orders: Order[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-gray-900">أحدث الطلبات</h3>
      {recentOrders.length === 0 ? (
        <p className="text-sm text-gray-500">لا توجد طلبات</p>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-gray-500">
                  {order.user?.shopName ?? '—'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
