'use client';

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  totalAmount: number;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrderConfirmationDialog({
  isOpen,
  totalAmount,
  itemCount,
  onConfirm,
  onCancel,
}: OrderConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 text-center">تأكيد الطلب</h2>

        <div className="space-y-2 text-sm text-gray-700 text-center">
          <p>عدد القطع: {itemCount}</p>
          <p>الإجمالي: {totalAmount.toFixed(2)} ر.س</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            تأكيد
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
