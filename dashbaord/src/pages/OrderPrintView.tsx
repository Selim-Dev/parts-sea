import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import type { Order } from '../types/index';

export default function OrderPrintView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const res = await client.get(`/orders/${id}`);
        setOrder(res.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-500">لم يتم العثور على الطلب</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 text-blue-600 hover:underline"
          >
            العودة للطلبات
          </button>
        </div>
      </div>
    );
  }

  const items = order.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.unitPrice ?? 0),
    0,
  );

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          nav, header, aside, footer {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      <div dir="rtl" className="mx-auto max-w-[210mm] bg-white p-8 font-sans print:p-0">
        {/* Action buttons — hidden when printing */}
        <div className="no-print mb-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            🖨️ طباعة
          </button>
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            ← العودة للطلب
          </button>
        </div>

        {/* Print header */}
        <div className="mb-8 border-b-2 border-gray-800 pb-4 text-center">
          <img src="/BAHR LOGO SVG.svg" alt="بحر" className="h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">طلب قطع غيار</h1>
        </div>

        {/* Order info */}
        <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">رقم الطلب: </span>
            <span className="text-gray-900">{order.orderNumber}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">اسم المحل: </span>
            <span className="text-gray-900">
              {order.user?.shopName || order.user?.username || '—'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">التاريخ: </span>
            <span className="text-gray-900">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Items table */}
        <table className="mb-6 w-full border-collapse border border-gray-300 text-right text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">رقم القطعة</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">الاسم</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">الكمية</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">سعر الوحدة</th>
              <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-700">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id ?? idx}>
                <td className="border border-gray-300 px-4 py-2">{item.partNumber ?? '—'}</td>
                <td className="border border-gray-300 px-4 py-2">{item.partName ?? '—'}</td>
                <td className="border border-gray-300 px-4 py-2">{item.quantity ?? 0}</td>
                <td className="border border-gray-300 px-4 py-2">{(item.unitPrice ?? 0).toFixed(2)} ر.س</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2)} ر.س
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td colSpan={4} className="border border-gray-300 px-4 py-2 font-bold text-gray-800">
                الإجمالي
              </td>
              <td className="border border-gray-300 px-4 py-2 font-bold text-gray-900">
                {total.toFixed(2)} ر.س
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
