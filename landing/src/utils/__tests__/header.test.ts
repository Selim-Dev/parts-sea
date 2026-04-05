import * as fc from 'fast-check';

import { getShopGreeting } from '../header';

// ── Arbitraries ──────────────────────────────────────────────────────────

/** Generates non-empty strings that contain at least one non-whitespace character */
const arbNonEmptyString: fc.Arbitrary<string> = fc
  .tuple(
    fc.string({ minLength: 0, maxLength: 5 }),
    fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c.trim().length > 0),
    fc.string({ minLength: 0, maxLength: 5 }),
  )
  .map(([prefix, core, suffix]) => prefix + core + suffix);

/** Generates strings that are empty or contain only whitespace characters */
const arbEmptyOrWhitespace: fc.Arbitrary<string> = fc.constantFrom(
  '',
  ' ',
  '  ',
  '\t',
  '\n',
  ' \t\n ',
);

/** Generates a value representing "no shopName" — undefined, null, or empty/whitespace */
const arbMissingShopName: fc.Arbitrary<string | undefined | null> = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  arbEmptyOrWhitespace,
);

// ── Property 12: Shop header greeting uses shopName with username fallback ──
// Feature: dashboard-modernization, Property 12: Shop header greeting uses shopName with username fallback
// **Validates: Requirements 15.2, 15.3**

describe('Property 12: Shop header greeting uses shopName with username fallback', () => {
  it('returns "أهلاً، [shopName]" for any non-empty shopName', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        fc.option(fc.string(), { nil: undefined }),
        (shopName, username) => {
          const result = getShopGreeting(shopName, username);
          expect(result).toBe(`أهلاً، ${shopName}`);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns "أهلاً، [username]" when shopName is missing and username is non-empty', () => {
    fc.assert(
      fc.property(
        arbMissingShopName,
        arbNonEmptyString,
        (shopName, username) => {
          const result = getShopGreeting(shopName ?? undefined, username);
          expect(result).toBe(`أهلاً، ${username}`);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns just "أهلاً" when both shopName and username are empty/undefined', () => {
    fc.assert(
      fc.property(
        arbMissingShopName,
        fc.oneof(fc.constant(undefined), arbEmptyOrWhitespace),
        (shopName, username) => {
          const result = getShopGreeting(shopName ?? undefined, username);
          expect(result).toBe('أهلاً');
        },
      ),
      { numRuns: 100 },
    );
  });
});
