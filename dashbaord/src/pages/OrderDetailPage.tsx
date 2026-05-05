import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import type { Order, OrderStatus } from '../types/index';

const STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'قيد الانتظار' },
  { status: 'approved', label: 'معتمد' },
  { status: 'preparing', label: 'قيد التحضير' },
  { status: 'ready', label: 'جاهز' },
  { status: 'delivered', label: 'تم التسليم' },
];

const STEP_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-blue-500',
  preparing: 'bg-indigo-500',
  ready: 'bg-green-500',
  delivered: 'bg-gray-400',
};

const nextStatusMap: Record<string, { status: OrderStatus; label: string } | null> = {
  pending: { status: 'approved', label: 'اعتماد الطلب' },
  approved: { status: 'preparing', label: 'بدء التحضير' },
  preparing: { status: 'ready', label: 'جاهز للتسليم' },
  ready: { status: 'delivered', label: 'تسليم الطلب' },
  delivered: null,
  cancelled: null,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
      setOrder({ ...res.data, items: res.data.items ?? [] });
    } catch {
      setError('فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdating(false);
    }
  }

  async function cancelOrder() {
    setCancelling(true);
    setError('');
    setShowCancelConfirm(false);
    try {
      const res = await client.patch(`/orders/${id}/cancel`);
      setOrder({ ...res.data, items: res.data.items ?? [] });
    } catch {
      setError('فشل إلغاء الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setCancelling(false);
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
        <button onClick={() => navigate('/orders')} className="mt-4 text-blue-600 hover:underline">
          العودة للطلبات
        </button>
      </div>
    );
  }

  const next = nextStatusMap[order.status];
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canCancel = ['pending', 'approved'].includes(order.status);
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.status === order.status);
  const orderTotal = (order.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.unitPrice ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <button
            onClick={() => navigate(`/orders/${id}/print`)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            طباعة
          </button>
        </div>
      </div>

      {/* Status stepper — only for non-cancelled orders */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-4">مسار الطلب</p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              const isLast = idx === STATUS_STEPS.length - 1;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? `${STEP_COLORS[step.status] ?? 'bg-gray-400'} shadow-md`
                        : isCurrent
                          ? `${STEP_COLORS[step.status] ?? 'bg-gray-400'} ring-4 ring-offset-2 ${step.status === 'pending' ? 'ring-amber-200' : step.status === 'approved' ? 'ring-blue-200' : step.status === 'preparing' ? 'ring-indigo-200' : step.status === 'ready' ? 'ring-green-200' : 'ring-gray-200'} shadow-lg`
                          : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight max-w-[60px] ${
                      isCurrent ? 'text-gray-800 font-semibold' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all ${isCompleted ? 'bg-gray-300' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-700">تم إلغاء هذا الطلب</p>
        </div>
      )}

      {/* Order info card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">رقم الطلب</p>
            <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">اسم المحل</p>
            <p className="font-semibold text-gray-800 text-sm">
              {order.user?.shopName || order.user?.username || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">التاريخ</p>
            <p className="font-semibold text-gray-800 text-sm">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">الإجمالي</p>
            <p className="font-bold text-gray-900 text-base">{orderTotal.toFixed(2)} ر.س</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {!isCancelled && !isDelivered && (
        <div className="flex flex-wrap items-center gap-3">
          {next && (
            <button
              onClick={() => updateStatus(next.status)}
              disabled={updating || cancelling}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              {updating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  {next.label}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </>
              )}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={updating || cancelling}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {cancelling ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                  جاري الإلغاء...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  إلغاء الطلب
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Items table */}
      <div className="overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">القطع المطلوبة</h3>
          <span className="text-xs text-gray-400">{(order.items ?? []).length} قطعة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">رقم القطعة</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">الاسم</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">الكمية</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">سعر الوحدة</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item, idx) => (
                <tr key={item.id ?? idx} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-sm text-gray-700">{item.partNumber ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{item.partName ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-xs">{item.quantity ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{(item.unitPrice ?? 0).toFixed(2)} ر.س</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2)} ر.س</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={4} className="px-5 py-4 text-sm font-bold text-gray-700 text-right">الإجمالي</td>
                <td className="px-5 py-4 text-base font-extrabold text-gray-900">{orderTotal.toFixed(2)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">تأكيد إلغاء الطلب</h3>
                <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              هل أنت متأكد من إلغاء الطلب <strong>{order.orderNumber}</strong>؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={cancelOrder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                إلغاء الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
