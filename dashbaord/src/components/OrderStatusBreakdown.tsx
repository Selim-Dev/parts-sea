import type { Order, OrderStatus } from '../types/index';
import { computeStatusBreakdown } from '../utils/analytics';

interface OrderStatusBreakdownProps {
  orders: Order[];
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-800' },
  approved: { label: 'تمت الموافقة', color: 'bg-blue-500', bg: 'bg-blue-50 text-blue-800' },
  preparing: { label: 'قيد التحضير', color: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-800' },
  ready: { label: 'جاهز', color: 'bg-green-500', bg: 'bg-green-50 text-green-800' },
  delivered: { label: 'تم التسليم', color: 'bg-gray-500', bg: 'bg-gray-50 text-gray-800' },
  cancelled: { label: 'ملغي', color: 'bg-red-500', bg: 'bg-red-50 text-red-800' },
};

const statusOrder: OrderStatus[] = ['pending', 'approved', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function OrderStatusBreakdown({ orders }: OrderStatusBreakdownProps) {
  const breakdown = computeStatusBreakdown(orders);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-gray-900">حالة الطلبات</h3>
      <div className="space-y-3">
        {statusOrder.map((status) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${statusConfig[status].color}`} />
              <span className="text-sm text-gray-700">{statusConfig[status].label}</span>
            </div>
            <span className={`rounded-full px-3 py-0.5 text-sm font-medium ${statusConfig[status].bg}`}>
              {breakdown[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
