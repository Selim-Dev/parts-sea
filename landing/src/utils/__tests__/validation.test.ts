import * as fc from 'fast-check';
import { validateLoginForm } from '../validation';

// ── Arbitraries ──────────────────────────────────────────────────────────

/** Generates strings that are empty or contain only whitespace characters */
const arbEmptyOrWhitespace: fc.Arbitrary<string> = fc.constantFrom(
  '',
  ' ',
  '  ',
  '\t',
  '\n',
  ' \t\n ',
);

/** Generates non-empty strings that contain at least one non-whitespace character */
const arbNonEmptyString: fc.Arbitrary<string> = fc
  .tuple(
    fc.string({ minLength: 0, maxLength: 5 }),
    fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c.trim().length > 0),
    fc.string({ minLength: 0, maxLength: 5 }),
  )
  .map(([prefix, core, suffix]) => prefix + core + suffix);

// ── Property 11: Login validation catches empty fields ──────────────────
// Feature: dashboard-modernization, Property 11: Login validation catches empty fields
// **Validates: Requirements 14.1, 14.2**

describe('Property 11: Login validation catches empty fields', () => {
  it('returns username error for any empty or whitespace-only username', () => {
    fc.assert(
      fc.property(
        arbEmptyOrWhitespace,
        fc.string(),
        (username, password) => {
          const errors = validateLoginForm(username, password);
          expect(errors.username).toBe('يرجى إدخال اسم المستخدم');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns password error for any empty or whitespace-only password', () => {
    fc.assert(
      fc.property(
        fc.string(),
        arbEmptyOrWhitespace,
        (username, password) => {
          const errors = validateLoginForm(username, password);
          expect(errors.password).toBe('يرجى إدخال كلمة المرور');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns no errors for any non-empty, non-whitespace username and password', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        (username, password) => {
          const errors = validateLoginForm(username, password);
          expect(errors).toEqual({});
        },
      ),
      { numRuns: 100 },
    );
  });
});
