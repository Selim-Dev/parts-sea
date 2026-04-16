import type { OrderStatus } from '../types/index';

const statusConfig: Record<OrderStatus, { label: string; dot: string; className: string }> = {
  pending: {
    label: 'قيد الانتظار',
    dot: 'bg-amber-500',
    className: 'bg-amber-50 text-amber-800 border border-amber-200',
  },
  approved: {
    label: 'معتمد',
    dot: 'bg-blue-500',
    className: 'bg-blue-50 text-blue-800 border border-blue-200',
  },
  preparing: {
    label: 'قيد التحضير',
    dot: 'bg-indigo-500',
    className: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  },
  ready: {
    label: 'جاهز',
    dot: 'bg-green-500',
    className: 'bg-green-50 text-green-800 border border-green-200',
  },
  delivered: {
    label: 'تم التسليم',
    dot: 'bg-gray-400',
    className: 'bg-gray-50 text-gray-600 border border-gray-200',
  },
  cancelled: {
    label: 'ملغي',
    dot: 'bg-red-400',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}
