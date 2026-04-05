import type { Order, OrderItem, Part } from '../types/index';

export interface StatusBreakdown {
  pending: number;
  approved: number;
  preparing: number;
  ready: number;
  delivered: number;
}

/**
 * Compute total revenue from an array of orders.
 * Revenue = sum of (quantity × unitPrice) for every item across every order.
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
  };

  for (const order of orders) {
    if (order.status in breakdown) {
      breakdown[order.status]++;
    }
  }

  return breakdown;
}

/**
 * Compute the total for a single order's items.
 * Total = sum of (quantity × unitPrice) for each item.
 */
export function computeOrderTotal(items: OrderItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

/**
 * Filter parts with stock at or below the given threshold.
 * Default threshold is 5.
 */
export function filterLowStockParts(parts: Part[], threshold: number = 5): Part[] {
  return parts.filter((part) => part.stock <= threshold);
}

/**
 * Return a time-of-day greeting in Arabic.
 * "صباح الخير" for morning (hour < 12), "مساء الخير" for afternoon/evening.
 */
export function getGreeting(hour: number): string {
  return hour < 12 ? 'صباح الخير' : 'مساء الخير';
}

/**
 * Filter orders where orderNumber or user.shopName contains the search text (case-insensitive).
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
