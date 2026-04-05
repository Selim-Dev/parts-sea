# Implementation Plan: Dashboard Modernization

## Overview

Modernize both the Admin Dashboard (`dashbaord/`) and Shop App (`landing/`) with analytics, UI improvements, and UX enhancements. All changes are frontend-only using existing API endpoints. Implementation proceeds in logical phases: shared utilities first, then admin dashboard components, then shop app components, with property-based tests alongside each phase.

## Tasks

- [x] 1. Create admin dashboard utility functions and analytics infrastructure
  - [x] 1.1 Create `dashbaord/src/utils/analytics.ts` with pure utility functions
    - Implement `computeTotalRevenue(orders)`: sum of all `quantity × unitPrice` across all order items
    - Implement `computeStatusBreakdown(orders)`: group orders by status (pending, approved, preparing, ready, delivered) and return counts
    - Implement `computeOrderTotal(items)`: sum of `quantity × unitPrice` for a single order's items
    - Implement `filterLowStockParts(parts, threshold?)`: return parts with `stock <= threshold` (default 5)
    - Implement `getGreeting(hour)`: return "صباح الخير" for hour < 12, "مساء الخير" for hour >= 12
    - Implement `filterOrdersBySearch(orders, searchText)`: filter orders where orderNumber or user.shopName contains searchText (case-insensitive)
    - _Requirements: 1.2, 1.3, 1.5, 5.2, 7.1, 9.3_

  - [x]* 1.2 Write property tests for analytics utilities (`dashbaord/src/utils/__tests__/analytics.test.ts`)
    - **Property 1: Revenue computation is sum of all order item totals**
    - **Validates: Requirement 1.2**
    - **Property 2: Status breakdown counts sum to total orders**
    - **Validates: Requirement 1.3**
    - **Property 3: Recent orders are sorted by date descending and capped at 5**
    - **Validates: Requirement 1.4**
    - **Property 4: Low stock filter returns exactly parts with stock at or below threshold**
    - **Validates: Requirements 1.5, 6.1, 6.3**
    - **Property 5: Order search filter returns only matching orders**
    - **Validates: Requirement 5.2**
    - **Property 6: Order total equals sum of item line totals**
    - **Validates: Requirements 7.1, 7.2**
    - **Property 7: Time-of-day greeting is correct for all hours**
    - **Validates: Requirement 9.3**

- [x] 2. Create admin dashboard shared UI components
  - [x] 2.1 Create `dashbaord/src/components/LoadingSpinner.tsx`
    - Centered spinner animation with configurable label (default: "جاري التحميل...")
    - _Requirements: 8.1_

  - [x] 2.2 Create `dashbaord/src/components/EmptyState.tsx`
    - Accept `icon` and `message` props, render illustrative empty state
    - _Requirements: 8.2_

  - [x] 2.3 Create `dashbaord/src/components/ErrorState.tsx`
    - Accept `message` and `onRetry` props, render error message with "إعادة المحاولة" retry button
    - _Requirements: 8.3_

  - [x] 2.4 Create `dashbaord/src/components/KPICard.tsx`
    - Accept `title`, `value`, `icon`, `color` props
    - Render rounded-2xl card with color-coded icon area and value display
    - _Requirements: 1.2, 3.1_

- [x] 3. Build Analytics Page and sub-components
  - [x] 3.1 Create `dashbaord/src/components/OrderStatusBreakdown.tsx`
    - Accept `orders` array, use `computeStatusBreakdown` to render status counts
    - Display counts for: pending, approved, preparing, ready, delivered
    - _Requirements: 1.3_

  - [x] 3.2 Create `dashbaord/src/components/RecentOrdersList.tsx`
    - Accept `orders` array, sort by `createdAt` descending, take first 5
    - Display order number, shop name, date, and status for each
    - _Requirements: 1.4_

  - [x] 3.3 Create `dashbaord/src/components/LowStockAlerts.tsx`
    - Accept `parts` array, use `filterLowStockParts` to filter and display parts with stock <= 5
    - _Requirements: 1.5_

  - [x] 3.4 Create `dashbaord/src/pages/AnalyticsPage.tsx`
    - Fetch orders via `GET /orders/all` and parts via `GET /parts?limit=1000`
    - Compute KPIs using utility functions: total orders, pending orders, total revenue, total parts
    - Render KPICard components, OrderStatusBreakdown, RecentOrdersList, LowStockAlerts
    - Use LoadingSpinner, EmptyState, ErrorState for loading/empty/error states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1, 8.2, 8.3_

- [x] 4. Update admin dashboard routing and sidebar
  - [x] 4.1 Update `dashbaord/src/App.tsx` routing
    - Change root path `/` to render `AnalyticsPage` instead of redirecting to `/parts`
    - _Requirements: 1.1_

  - [x] 4.2 Update `dashbaord/src/components/DashboardLayout.tsx` sidebar
    - Add "لوحة التحكم" nav link as first item with chart icon, navigating to `/`
    - Ensure active state highlighting via NavLink `isActive`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.3 Update `dashbaord/src/components/DashboardLayout.tsx` header
    - Display current page title derived from route using PAGE_TITLES mapping
    - Display logged-in admin username and role badge ("مدير") next to logout button
    - Display time-of-day greeting using `getGreeting()` utility
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 5. Checkpoint — Admin dashboard analytics and navigation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Modernize admin dashboard pages (Parts and Orders)
  - [x] 6.1 Update `dashbaord/src/pages/PartsListPage.tsx` UI modernization
    - Apply rounded-2xl card container with subtle border and soft shadow
    - Add page subtitle below heading
    - Apply alternating row colors (`even:bg-gray-50/50`) on table rows
    - Apply uppercase column headers with bottom border separator
    - Add hover transition effects on table rows
    - Add warning icon next to stock badge when `stock <= 5`
    - Add red "نفذ المخزون" badge when `stock === 0`
    - Add low stock summary count above table when any part has `stock <= 5`
    - Use LoadingSpinner, EmptyState, ErrorState for loading/empty/error states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 8.1, 8.2, 8.3_

  - [x] 6.2 Update `dashbaord/src/pages/OrdersListPage.tsx` UI modernization and search
    - Apply rounded-2xl card container with subtle border and soft shadow
    - Add page subtitle below heading
    - Apply alternating row colors and uppercase column headers with bottom border
    - Add hover transition effects on table rows
    - Add search input field above orders table
    - Implement client-side filtering using `filterOrdersBySearch` utility
    - Add "الإجمالي" (Total) column using `computeOrderTotal`, formatted as `X.XX ر.س`
    - Use LoadingSpinner, EmptyState, ErrorState for loading/empty/error states
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 7.1, 7.2, 8.1, 8.2, 8.3_

- [x] 7. Checkpoint — Admin dashboard fully complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create shop app utility functions
  - [x] 8.1 Create `landing/src/utils/validation.ts`
    - Implement `validateLoginForm(username, password)`: return error messages for empty/whitespace-only fields
    - _Requirements: 14.1, 14.2, 14.4_

  - [x] 8.2 Create `landing/src/utils/catalog.ts`
    - Implement `getCartQuantityForPart(items, partId)`: return quantity of matching cart item or 0
    - Implement `formatStockDisplay(stock)`: return `{ text, color }` based on stock level (green > 5, amber 1-5 with "كمية محدودة", red 0 with "نفذ المخزون")
    - _Requirements: 10.1, 10.2, 12.1, 12.2, 12.3_

  - [x] 8.3 Create `landing/src/utils/header.ts`
    - Implement greeting function: return "أهلاً، [shopName]" or fallback to "أهلاً، [username]"
    - _Requirements: 15.2, 15.3_

  - [x]* 8.4 Write property tests for validation utilities (`landing/src/utils/__tests__/validation.test.ts`)
    - **Property 11: Login validation catches empty fields**
    - **Validates: Requirements 14.1, 14.2**

  - [x]* 8.5 Write property tests for catalog utilities (`landing/src/utils/__tests__/catalog.test.ts`)
    - **Property 8: Cart quantity lookup returns correct quantity**
    - **Validates: Requirements 10.1, 10.2**
    - **Property 10: Stock display formatting matches stock level**
    - **Validates: Requirements 11.4, 12.1, 12.2**

  - [x]* 8.6 Write property tests for header utilities (`landing/src/utils/__tests__/header.test.ts`)
    - **Property 12: Shop header greeting uses shopName with username fallback**
    - **Validates: Requirements 15.2, 15.3**

- [x] 9. Implement shop app catalog enhancements
  - [x] 9.1 Create `landing/src/components/CartIndicatorBadge.tsx`
    - Accept `quantity` prop, render blue badge showing cart quantity
    - Only render when `quantity > 0`
    - _Requirements: 10.1, 10.4_

  - [x] 9.2 Create `landing/src/components/QuickViewModal.tsx`
    - Accept `part`, `isOpen`, `onClose`, `onAddToCart`, `cartQuantity` props
    - Display part name, partNumber, price, stock ("المخزون: X قطعة"), full description, image
    - Include "أضف للسلة" button; disable with "نفذ المخزون" when stock === 0
    - Close on backdrop click or Escape key (useEffect listener)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 9.3 Update `landing/src/app/catalog/page.tsx` with cart indicators, stock display, and quick view
    - Integrate `useCart` to get cart items for CartIndicatorBadge lookup
    - Add `selectedPart` state for QuickViewModal; open on card click
    - Show CartIndicatorBadge on cards where part is in cart
    - Show exact stock count "المخزون: X" on each card using `formatStockDisplay`
    - Show amber "كمية محدودة" label when 1 <= stock <= 5
    - Show red "نفذ المخزون" + disabled add button when stock === 0
    - When part is in cart and user clicks add, increment quantity by 1 and update indicator
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.1, 12.2, 12.3_

  - [x]* 9.4 Write property test for cart addToCart increment (`landing/src/context/__tests__/CartContext.test.tsx`)
    - **Property 9: Adding a part to cart increments its quantity by exactly 1**
    - **Validates: Requirement 10.3**

- [x] 10. Implement shop app login enhancements
  - [x] 10.1 Update `landing/src/app/login/page.tsx` with auto-redirect and validation
    - Check `useAuth().user` and `isLoading` on mount
    - If authenticated, redirect to `/catalog` via `router.push`
    - While `isLoading`, show spinner instead of login form
    - Add `errors` state for validation messages
    - Validate before submit: empty username → "يرجى إدخال اسم المستخدم", empty password → "يرجى إدخال كلمة المرور"
    - Clear field error on `onChange`
    - Use `validateLoginForm` utility for validation logic
    - _Requirements: 13.1, 13.2, 13.3, 14.1, 14.2, 14.3, 14.4_

- [x] 11. Implement shop app header and order confirmation
  - [x] 11.1 Update `landing/src/components/AppLayout.tsx` (ShopHeader)
    - Access `useAuth().user` to get `shopName` and `username`
    - Display greeting using header utility: "أهلاً، [shopName]" with username fallback
    - Show greeting on desktop (`hidden md:block`), hide on mobile
    - Display shopName next to logout button
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 11.2 Create `landing/src/components/OrderConfirmationDialog.tsx`
    - Accept `isOpen`, `totalAmount`, `itemCount`, `onConfirm`, `onCancel` props
    - Display total amount and number of items
    - Include "تأكيد" (Confirm) and "إلغاء" (Cancel) buttons
    - Close on backdrop click or cancel
    - _Requirements: 16.1, 16.2, 16.4_

  - [x] 11.3 Update `landing/src/app/cart/page.tsx` with order confirmation dialog
    - Add `showConfirmDialog` state
    - On "إرسال الطلب" click, show OrderConfirmationDialog with total and item count
    - On confirm, proceed with existing `handleSubmitOrder`
    - On cancel, close dialog without submitting
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using `fast-check`
- All 16 requirements are covered across tasks 1–11
- Admin dashboard tasks (1–7) and shop app tasks (8–11) can be developed in parallel if needed
