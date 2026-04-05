import type { Part } from '../types/index';
import { filterLowStockParts } from '../utils/analytics';

interface LowStockAlertsProps {
  parts: Part[];
}

export default function LowStockAlerts({ parts }: LowStockAlertsProps) {
  const lowStockParts = filterLowStockParts(parts);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-gray-900">تنبيهات المخزون المنخفض</h3>
      {lowStockParts.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>جميع القطع متوفرة بكميات كافية</span>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockParts.map((part) => (
            <div
              key={part.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900">{part.name}</span>
                <span className="text-xs text-gray-500">{part.partNumber}</span>
              </div>
              <div>
                {part.stock === 0 ? (
                  <span className="rounded-full bg-red-100 px-3 py-0.5 text-sm font-medium text-red-700">
                    نفذ المخزون
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-sm font-medium text-amber-700">
                    {part.stock} قطعة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
