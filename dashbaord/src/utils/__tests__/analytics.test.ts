import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeTotalRevenue,
  computeStatusBreakdown,
  computeOrderTotal,
  filterLowStockParts,
  getGreeting,
  filterOrdersBySearch,
} from '../analytics';
import type { Order, OrderItem, Part, OrderStatus } from '../../types/index';

// ── Arbitraries ──────────────────────────────────────────────────────────

const ORDER_STATUSES: OrderStatus[] = ['pending', 'approved', 'preparing', 'ready', 'delivered'];

const arbOrderItem: fc.Arbitrary<OrderItem> = fc.record({
  id: fc.nat(),
  orderId: fc.nat(),
  partId: fc.nat(),
  partNumber: fc.string({ minLength: 1 }),
  partName: fc.string({ minLength: 1 }),
  unitPrice: fc.double({ min: 0, max: 10_000, noNaN: true, noDefaultInfinity: true }),
  quantity: fc.integer({ min: 0, max: 1_000 }),
});

const arbUser = fc.record({
  id: fc.nat(),
  username: fc.string({ minLength: 1 }),
  role: fc.constant('shop' as const),
  shopName: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
});

const arbISODate = fc
  .integer({ min: new Date('2020-01-01T00:00:00.000Z').getTime(), max: new Date('2030-01-01T00:00:00.000Z').getTime() })
  .map((ts) => new Date(ts).toISOString());

const arbOrder: fc.Arbitrary<Order> = fc.record({
  id: fc.nat(),
  orderNumber: fc.string({ minLength: 1 }),
  userId: fc.nat(),
  status: fc.constantFrom(...ORDER_STATUSES),
  createdAt: arbISODate,
  updatedAt: arbISODate,
  items: fc.array(arbOrderItem, { minLength: 0, maxLength: 10 }),
  user: fc.option(arbUser, { nil: undefined }),
});

const arbPart: fc.Arbitrary<Part> = fc.record({
  id: fc.nat(),
  partNumber: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  price: fc.double({ min: 0, max: 10_000, noNaN: true, noDefaultInfinity: true }),
  description: fc.string(),
  stock: fc.integer({ min: 0, max: 1_000 }),
  category: fc.string(),
  brand: fc.string(),
  createdAt: arbISODate,
  updatedAt: arbISODate,
});

// ── Property 1: Revenue computation is sum of all order item totals ─────
// Feature: dashboard-modernization, Property 1: Revenue computation is sum of all order item totals
// **Validates: Requirements 1.2**

describe('Property 1: Revenue computation is sum of all order item totals', () => {
  it('computeTotalRevenue equals the sum of quantity × unitPrice across all items in all orders', () => {
    fc.assert(
      fc.property(fc.array(arbOrder, { minLength: 0, maxLength: 20 }), (orders) => {
        const result = computeTotalRevenue(orders);
        const expected = orders.reduce(
          (total, order) =>
            total +
            (order.items ?? []).reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0,
            ),
          0,
        );
        expect(result).toBeCloseTo(expected, 5);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 2: Status breakdown counts sum to total orders ─────────────
// Feature: dashboard-modernization, Property 2: Status breakdown counts sum to total orders
// **Validates: Requirements 1.3**

describe('Property 2: Status breakdown counts sum to total orders', () => {
  it('sum of all status counts equals the total number of orders', () => {
    fc.assert(
      fc.property(fc.array(arbOrder, { minLength: 0, maxLength: 50 }), (orders) => {
        const breakdown = computeStatusBreakdown(orders);
        const totalCounts =
          breakdown.pending +
          breakdown.approved +
          breakdown.preparing +
          breakdown.ready +
          breakdown.delivered;
        expect(totalCounts).toBe(orders.length);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 3: Recent orders are sorted by date descending and capped at 5 ─
// Feature: dashboard-modernization, Property 3: Recent orders are sorted by date descending and capped at 5
// **Validates: Requirements 1.4**

describe('Property 3: Recent orders are sorted by date descending and capped at 5', () => {
  it('sorting orders by createdAt descending and taking first 5 produces at most 5 items in descending date order', () => {
    fc.assert(
      fc.property(fc.array(arbOrder, { minLength: 0, maxLength: 20 }), (orders) => {
        // Replicate the logic used in RecentOrdersList component
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Capped at 5
        expect(recentOrders.length).toBeLessThanOrEqual(5);
        expect(recentOrders.length).toBe(Math.min(orders.length, 5));

        // Sorted descending by date
        for (let i = 1; i < recentOrders.length; i++) {
          const prev = new Date(recentOrders[i - 1].createdAt).getTime();
          const curr = new Date(recentOrders[i].createdAt).getTime();
          expect(prev).toBeGreaterThanOrEqual(curr);
        }
      }),
      { numRuns: 100 },
    );
  });
});


// ── Property 4: Low stock filter returns exactly parts with stock at or below threshold ─
// Feature: dashboard-modernization, Property 4: Low stock filter returns exactly parts with stock at or below threshold
// **Validates: Requirements 1.5, 6.1, 6.3**

describe('Property 4: Low stock filter returns exactly parts with stock at or below threshold', () => {
  it('filterLowStockParts returns exactly the parts where stock <= threshold', () => {
    fc.assert(
      fc.property(
        fc.array(arbPart, { minLength: 0, maxLength: 30 }),
        fc.integer({ min: 0, max: 100 }),
        (parts, threshold) => {
          const result = filterLowStockParts(parts, threshold);
          const expected = parts.filter((p) => p.stock <= threshold);

          expect(result.length).toBe(expected.length);
          // Every returned part has stock <= threshold
          for (const part of result) {
            expect(part.stock).toBeLessThanOrEqual(threshold);
          }
          // Every part with stock <= threshold is included
          for (const part of expected) {
            expect(result).toContainEqual(part);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('filterLowStockParts uses default threshold of 5 when not specified', () => {
    fc.assert(
      fc.property(fc.array(arbPart, { minLength: 0, maxLength: 30 }), (parts) => {
        const result = filterLowStockParts(parts);
        const expected = parts.filter((p) => p.stock <= 5);
        expect(result.length).toBe(expected.length);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 5: Order search filter returns only matching orders ────────
// Feature: dashboard-modernization, Property 5: Order search filter returns only matching orders
// **Validates: Requirements 5.2**

describe('Property 5: Order search filter returns only matching orders', () => {
  it('filterOrdersBySearch returns only orders where orderNumber or shopName contains searchText', () => {
    fc.assert(
      fc.property(
        fc.array(arbOrder, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
        (orders, searchText) => {
          const result = filterOrdersBySearch(orders, searchText);
          const query = searchText.toLowerCase();

          // Every returned order matches the search
          for (const order of result) {
            const orderNumber = order.orderNumber?.toLowerCase() ?? '';
            const shopName = order.user?.shopName?.toLowerCase() ?? '';
            expect(orderNumber.includes(query) || shopName.includes(query)).toBe(true);
          }

          // Every matching order is included
          const expectedCount = orders.filter((o) => {
            const on = o.orderNumber?.toLowerCase() ?? '';
            const sn = o.user?.shopName?.toLowerCase() ?? '';
            return on.includes(query) || sn.includes(query);
          }).length;
          expect(result.length).toBe(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('filterOrdersBySearch returns all orders when searchText is empty/whitespace', () => {
    fc.assert(
      fc.property(
        fc.array(arbOrder, { minLength: 0, maxLength: 20 }),
        fc.constantFrom('', '  ', '\t'),
        (orders, searchText) => {
          const result = filterOrdersBySearch(orders, searchText);
          expect(result.length).toBe(orders.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});


// ── Property 6: Order total equals sum of item line totals ──────────────
// Feature: dashboard-modernization, Property 6: Order total equals sum of item line totals
// **Validates: Requirements 7.1, 7.2**

describe('Property 6: Order total equals sum of item line totals', () => {
  it('computeOrderTotal equals the sum of quantity × unitPrice for each item', () => {
    fc.assert(
      fc.property(fc.array(arbOrderItem, { minLength: 0, maxLength: 15 }), (items) => {
        const result = computeOrderTotal(items);
        const expected = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        expect(result).toBeCloseTo(expected, 5);
      }),
      { numRuns: 100 },
    );
  });

  it('formatted order total matches X.XX ر.س pattern', () => {
    fc.assert(
      fc.property(fc.array(arbOrderItem, { minLength: 0, maxLength: 15 }), (items) => {
        const total = computeOrderTotal(items);
        const formatted = `${total.toFixed(2)} ر.س`;
        expect(formatted).toMatch(/^\d+\.\d{2} ر\.س$/);
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 7: Time-of-day greeting is correct for all hours ───────────
// Feature: dashboard-modernization, Property 7: Time-of-day greeting is correct for all hours
// **Validates: Requirements 9.3**

describe('Property 7: Time-of-day greeting is correct for all hours', () => {
  it('getGreeting returns "صباح الخير" for hour < 12 and "مساء الخير" for hour >= 12', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreeting(hour);
        if (hour < 12) {
          expect(result).toBe('صباح الخير');
        } else {
          expect(result).toBe('مساء الخير');
        }
      }),
      { numRuns: 100 },
    );
  });
});
