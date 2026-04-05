import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import type { Order, OrderStatus } from '../types/index';

const nextStatusMap: Record<string, { status: OrderStatus; label: string } | null> = {
  pending: { status: 'approved', label: 'اعتماد الطلب' },
  approved: { status: 'preparing', label: 'بدء التحضير' },
  preparing: { status: 'ready', label: 'جاهز للتسليم' },
  ready: { status: 'delivered', label: 'تم التسليم' },
  delivered: null,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await client.get(`/orders/${id}`);
        setOrder({ ...res.data, items: res.data.items ?? [] });
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  async function updateStatus(newStatus: OrderStatus) {
    setUpdating(true);
    setError('');
    try {
      const res = await client.patch(`/orders/${id}/status`, { status: newStatus });
      setOrder(res.data);
    } catch {
      setError('فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <p className="text-lg text-gray-500">لم يتم العثور على الطلب</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 text-blue-600 hover:underline"
        >
          العودة للطلبات
        </button>
      </div>
    );
  }

  const next = nextStatusMap[order.status];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل الطلب</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/orders/${id}/print`)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            🖨️ طباعة
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            ← العودة للطلبات
          </button>
        </div>
      </div>

      {/* Order info card */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500">رقم الطلب</p>
            <p className="mt-1 font-semibold text-gray-800">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">اسم المحل</p>
            <p className="mt-1 font-semibold text-gray-800">
              {order.user?.shopName || order.user?.username || '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">التاريخ</p>
            <p className="mt-1 font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">الحالة</p>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Status update button */}
      {next && (
        <div className="mb-6">
          <button
            onClick={() => updateStatus(next.status)}
            disabled={updating}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-linear-to-l from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {updating ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>جاري التحديث...</span>
              </>
            ) : (
              <>
                <span>{next.label}</span>
                <span className="text-blue-200 transition-transform duration-200 group-hover:translate-x-[-4px]">←</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Items table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">رقم القطعة</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">الاسم</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">الكمية</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">سعر الوحدة</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{item.partNumber}</td>
                <td className="px-6 py-4 text-gray-600">{item.partName}</td>
                <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                <td className="px-6 py-4 text-gray-600">{item.unitPrice.toFixed(2)} ر.س</td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {(item.quantity * item.unitPrice).toFixed(2)} ر.س
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-700">
                الإجمالي
              </td>
              <td className="px-6 py-4 font-bold text-gray-800">
                {(order.items ?? [])
                  .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                  .toFixed(2)}{' '}
                ر.س
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
