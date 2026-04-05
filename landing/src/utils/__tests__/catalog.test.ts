import * as fc from 'fast-check';

import type { CartItem, Part } from '@/types/index';

import { formatStockDisplay, getCartQuantityForPart } from '../catalog';

// ── Arbitraries ──────────────────────────────────────────────────────────

/** Generates a valid Part object */
const arbPart = (overrides?: Partial<Part>): fc.Arbitrary<Part> =>
  fc
    .record({
      id: fc.integer({ min: 1, max: 100_000 }),
      partNumber: fc.string({ minLength: 1, maxLength: 20 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      price: fc.float({ min: Math.fround(0.01), max: Math.fround(10_000), noNaN: true }),
      description: fc.string({ minLength: 0, maxLength: 100 }),
      stock: fc.integer({ min: 0, max: 10_000 }),
    })
    .map((p) => ({ ...p, ...overrides }));

/** Generates a CartItem with a positive quantity */
const arbCartItem: fc.Arbitrary<CartItem> = fc
  .record({
    part: arbPart(),
    quantity: fc.integer({ min: 1, max: 500 }),
  });

/** Generates an array of CartItems with unique part IDs */
const arbCartItems: fc.Arbitrary<CartItem[]> = fc
  .array(arbCartItem, { minLength: 0, maxLength: 20 })
  .map((items) => {
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.part.id)) return false;
      seen.add(item.part.id);
      return true;
    });
  });

// ── Property 8: Cart quantity lookup returns correct quantity ────────────
// Feature: dashboard-modernization, Property 8: Cart quantity lookup returns correct quantity
// **Validates: Requirements 10.1, 10.2**

describe('Property 8: Cart quantity lookup returns correct quantity', () => {
  it('returns the quantity of the matching cart item when part is in cart', () => {
    fc.assert(
      fc.property(
        arbCartItems.filter((items) => items.length > 0),
        (items) => {
          // Pick a random item from the cart
          const target = items[0];
          const result = getCartQuantityForPart(items, target.part.id);
          expect(result).toBe(target.quantity);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns 0 when part ID is not in the cart', () => {
    fc.assert(
      fc.property(
        arbCartItems,
        fc.integer({ min: -1_000_000, max: -1 }), // negative IDs guaranteed not in cart
        (items, missingId) => {
          const result = getCartQuantityForPart(items, missingId);
          expect(result).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('always returns a value >= 0', () => {
    fc.assert(
      fc.property(
        arbCartItems,
        fc.integer({ min: 1, max: 100_000 }),
        (items, partId) => {
          const result = getCartQuantityForPart(items, partId);
          expect(result).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ── Property 10: Stock display formatting matches stock level ───────────
// Feature: dashboard-modernization, Property 10: Stock display formatting matches stock level
// **Validates: Requirements 11.4, 12.1, 12.2**

describe('Property 10: Stock display formatting matches stock level', () => {
  it('returns green color for any stock > 5', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 100_000 }),
        (stock) => {
          const result = formatStockDisplay(stock);
          expect(result.color).toBe('green');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns amber color with "كمية محدودة" for stock 1-5', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (stock) => {
          const result = formatStockDisplay(stock);
          expect(result.color).toBe('amber');
          expect(result.text).toBe('كمية محدودة');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns red color with "نفذ المخزون" for stock === 0', () => {
    const result = formatStockDisplay(0);
    expect(result.color).toBe('red');
    expect(result.text).toBe('نفذ المخزون');
  });
});
