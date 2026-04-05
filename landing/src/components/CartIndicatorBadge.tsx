'use client';

interface CartIndicatorBadgeProps {
  quantity: number;
}

export default function CartIndicatorBadge({ quantity }: CartIndicatorBadgeProps) {
  if (quantity <= 0) return null;

  return (
    <span className="absolute top-3 left-3 z-10 bg-slate-900 text-white text-[10px] font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full px-1.5 shadow-lg ring-2 ring-white">
      {quantity}
    </span>
  );
}
