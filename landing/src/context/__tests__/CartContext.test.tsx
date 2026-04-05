import { act,renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import type { ReactNode } from 'react';

import type { Part } from '@/types/index';

import { CartProvider, useCart } from '../CartContext';

// ── Arbitraries ──────────────────────────────────────────────────────────

/** Generates a valid Part object */
const arbPart = (): fc.Arbitrary<Part> =>
  fc.record({
    id: fc.integer({ min: 1, max: 100_000 }),
    partNumber: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10_000), noNaN: true }),
    description: fc.string({ minLength: 0, maxLength: 100 }),
    stock: fc.integer({ min: 0, max: 10_000 }),
  });

/** Generates an array of unique Parts (unique by id) */
const arbUniqueParts = (): fc.Arbitrary<Part[]> =>
  fc.array(arbPart(), { minLength: 2, maxLength: 10 }).map((parts) => {
    const seen = new Set<number>();
    return parts.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }).filter((parts) => parts.length >= 2);

// ── Helpers ──────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

// ── Property 9: Adding a part to cart increments its quantity by exactly 1
// Feature: dashboard-modernization, Property 9: Adding a part to cart increments its quantity by exactly 1
// **Validates: Requirement 10.3**

describe('Property 9: Adding a part to cart increments its quantity by exactly 1', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a new part with quantity 1 when not already in cart', () => {
    fc.assert(
      fc.property(arbPart(), (part) => {
        localStorage.clear();
        const { result, unmount } = renderHook(() => useCart(), { wrapper });

        act(() => {
          result.current.addToCart(part);
        });

        const item = result.current.items.find((i) => i.part.id === part.id);
        expect(item).toBeDefined();
        expect(item!.quantity).toBe(1); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('increments quantity by exactly 1 when part is already in cart', () => {
    fc.assert(
      fc.property(
        arbPart(),
        fc.integer({ min: 1, max: 50 }),
        (part, initialCalls) => {
          localStorage.clear();
          const { result, unmount } = renderHook(() => useCart(), { wrapper });

          // Add the part `initialCalls` times to build up a known quantity
          for (let i = 0; i < initialCalls; i++) {
            act(() => {
              result.current.addToCart(part);
            });
          }

          const quantityBefore = result.current.items.find(
            (i) => i.part.id === part.id,
          )!.quantity; // eslint-disable-line @typescript-eslint/no-non-null-assertion

          // Call addToCart one more time
          act(() => {
            result.current.addToCart(part);
          });

          const quantityAfter = result.current.items.find(
            (i) => i.part.id === part.id,
          )!.quantity; // eslint-disable-line @typescript-eslint/no-non-null-assertion

          expect(quantityAfter).toBe(quantityBefore + 1);

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('does not affect other items in the cart when adding a part', () => {
    fc.assert(
      fc.property(
        arbUniqueParts(),
        (parts) => {
          localStorage.clear();
          const { result, unmount } = renderHook(() => useCart(), { wrapper });

          // Add all parts to cart
          for (const p of parts) {
            act(() => {
              result.current.addToCart(p);
            });
          }

          // Record quantities before
          const quantitiesBefore = new Map(
            result.current.items.map((i) => [i.part.id, i.quantity]),
          );

          // Add the first part again
          const target = parts[0];
          act(() => {
            result.current.addToCart(target);
          });

          // All other parts should have unchanged quantities
          for (const item of result.current.items) {
            if (item.part.id !== target.id) {
              expect(item.quantity).toBe(quantitiesBefore.get(item.part.id));
            }
          }

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
