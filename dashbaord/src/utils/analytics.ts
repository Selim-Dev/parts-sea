import type { Order, OrderItem, Part, OrderStatus } from '../types/index';

export interface StatusBreakdown {
  pending: number;
  approved: number;
  preparing: number;
  ready: number;
  delivered: number;
  cancelled: number;
}

/**
 * Compute total revenue from an array of orders.
 */
export function computeTotalRevenue(orders: Order[]): number {
  return orders.reduce(
    (total, order) => total + computeOrderTotal(order.items ?? []),
    0,
  );
}

/**
 * Group orders by status and return counts for each status.
 */
export function computeStatusBreakdown(orders: Order[]): StatusBreakdown {
  const breakdown: StatusBreakdown = {
    pending: 0,
    approved: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    const s = order.status as OrderStatus;
    if (s in breakdown) {
      breakdown[s as keyof StatusBreakdown]++;
    }
  }

  return breakdown;
}

/**
 * Compute the total for a single order's items.
 */
export function computeOrderTotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.unitPrice ?? 0),
    0,
  );
}

/**
 * Filter parts with stock at or below the given threshold.
 */
export function filterLowStockParts(parts: Part[], threshold: number = 5): Part[] {
  return parts.filter((part) => part.stock <= threshold);
}

/**
 * Return a time-of-day greeting in Arabic.
 */
export function getGreeting(hour: number): string {
  return hour < 12 ? 'صباح الخير' : 'مساء الخير';
}

/**
 * Filter orders where orderNumber or user.shopName contains the search text.
 */
export function filterOrdersBySearch(orders: Order[], searchText: string): Order[] {
  if (!searchText.trim()) {
    return orders;
  }

  const query = searchText.toLowerCase();

  return orders.filter((order) => {
    const orderNumber = order.orderNumber?.toLowerCase() ?? '';
    const shopName = order.user?.shopName?.toLowerCase() ?? '';
    if (orderNumber.includes(query) || shopName.includes(query)) return true;
    return (order.items ?? []).some(
      (item) => item.partNumber?.toLowerCase().includes(query) || item.partName?.toLowerCase().includes(query),
    );
  });
}
