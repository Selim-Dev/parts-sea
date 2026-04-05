import type { CartItem } from '@/types/index';

export interface StockDisplay {
  text: string;
  color: 'green' | 'amber' | 'red';
}

/**
 * Return the cart quantity for a given part, or 0 if not in cart.
 */
export function getCartQuantityForPart(items: CartItem[], partId: number): number {
  const item = items.find((i) => i.part.id === partId);
  return item ? item.quantity : 0;
}

/**
 * Format stock level into display text and color.
 * - stock > 5  → green with "المخزون: {stock}"
 * - 1–5        → amber with "كمية محدودة"
 * - 0          → red with "نفذ المخزون"
 */
export function formatStockDisplay(stock: number): StockDisplay {
  if (stock > 5) {
    return { text: `المخزون: ${stock}`, color: 'green' };
  }
  if (stock >= 1) {
    return { text: 'كمية محدودة', color: 'amber' };
  }
  return { text: 'نفذ المخزون', color: 'red' };
}
