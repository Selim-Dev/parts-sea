import type { OrderStatus } from '../types/index';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'قيد الانتظار',
    className: 'bg-amber-100 text-amber-800',
  },
  approved: {
    label: 'معتمد',
    className: 'bg-blue-100 text-blue-800',
  },
  preparing: {
    label: 'قيد التحضير',
    className: 'bg-indigo-100 text-indigo-800',
  },
  ready: {
    label: 'جاهز',
    className: 'bg-green-100 text-green-800',
  },
  delivered: {
    label: 'تم التسليم',
    className: 'bg-gray-100 text-gray-800',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
