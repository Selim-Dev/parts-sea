# Requirements Document

## Introduction

Modernize the existing spare parts ordering system by enhancing both the admin dashboard and the shop-facing application. On the admin side, add an analytics overview page, improve the UI/UX with modern design patterns, and introduce small but valuable features. On the shop side, enhance the catalog page with cart-aware indicators and a quick-view modal, improve the login page with auto-redirect and validation feedback, personalize the shop header with the shop name, and add an order submission confirmation dialog. All enhancements focus on practical, high-value UX improvements without requiring backend changes.

## Glossary

- **Dashboard**: The main admin panel application located in the `dashbaord/` folder, built with React 19, TypeScript, and Tailwind CSS 4
- **Analytics_Page**: A new overview page that displays key performance indicators and summaries computed from existing orders and parts data
- **KPI_Card**: A visual card component that displays a single key metric with its label and optional trend indicator
- **Sidebar**: The main navigation panel on the right side of the Dashboard containing navigation links
- **Parts_Page**: The existing page for managing spare parts (CRUD operations)
- **Orders_Page**: The existing page for viewing and filtering orders by status
- **Low_Stock_Alert**: A visual indicator shown when a part's stock quantity falls at or below a defined threshold
- **Admin**: A user with role "admin" who has full access to all Dashboard features
- **Shop**: A user with role "shop" who places orders through the storefront
- **Shop_App**: The shop-facing application located in the `landing/` folder, built with Next.js, React, TypeScript, and Tailwind CSS 4
- **Catalog_Page**: The page in the Shop_App where Shop users browse, search, and filter spare parts
- **Cart_Page**: The page in the Shop_App where Shop users review selected items and submit orders
- **Shop_Login_Page**: The login page for Shop users featuring a glassmorphism design with emerald/teal theme
- **Shop_Header**: The sticky top navigation bar in the Shop_App containing logo, navigation links, cart icon, and user actions
- **Quick_View_Modal**: A dialog overlay that displays full part details (name, part number, price, stock, full description, image) without navigating away from the Catalog_Page
- **Cart_Indicator**: A visual badge on a catalog part card showing the quantity of that part currently in the cart
- **Order_Confirmation_Dialog**: A modal dialog that asks the Shop user to confirm before submitting an order

## Requirements

### Requirement 1: Analytics Overview Page

**User Story:** As an Admin, I want to see a summary overview page when I open the dashboard, so that I can quickly understand the current state of orders, revenue, and inventory.

#### Acceptance Criteria

1. WHEN the Admin navigates to the root path "/", THE Dashboard SHALL display the Analytics_Page as the default landing page
2. THE Analytics_Page SHALL display KPI_Cards for: total orders count, pending orders count, total revenue (sum of all order item quantities multiplied by unit prices), and total parts count
3. THE Analytics_Page SHALL display a breakdown of orders grouped by status (pending, approved, preparing, ready, delivered) with the count for each status
4. THE Analytics_Page SHALL display a list of the 5 most recent orders showing order number, shop name, date, and status
5. THE Analytics_Page SHALL display a list of parts where stock is at or below 5 units as Low_Stock_Alerts
6. THE Analytics_Page SHALL compute all displayed data from the existing backend API endpoints (`GET /orders/all` and `GET /parts`)

### Requirement 2: Sidebar Navigation Update

**User Story:** As an Admin, I want the sidebar to include a link to the new Analytics page, so that I can navigate to the overview from anywhere in the dashboard.

#### Acceptance Criteria

1. THE Sidebar SHALL display a navigation link labeled "لوحة التحكم" (Dashboard) that navigates to the Analytics_Page
2. THE Sidebar SHALL display the "لوحة التحكم" link as the first item above the existing Parts and Orders links
3. WHEN the Admin is on the Analytics_Page, THE Sidebar SHALL highlight the "لوحة التحكم" link as active

### Requirement 3: UI Modernization — Card-Based Layout

**User Story:** As an Admin, I want the dashboard pages to use a modern card-based design with improved spacing and visual hierarchy, so that the interface feels polished and professional.

#### Acceptance Criteria

1. THE Dashboard SHALL use rounded-2xl cards with subtle border styling and soft shadow for all content containers across the Parts_Page, Orders_Page, and Analytics_Page
2. THE Dashboard SHALL use a consistent color palette based on slate/gray tones for backgrounds and indigo/blue accents for interactive elements
3. THE Parts_Page and Orders_Page SHALL display page titles with a descriptive subtitle line below the main heading
4. THE Dashboard SHALL apply hover transition effects on all table rows and clickable card elements

### Requirement 4: Improved Table Design

**User Story:** As an Admin, I want the data tables to look cleaner and more readable, so that I can scan information quickly.

#### Acceptance Criteria

1. THE Parts_Page table and Orders_Page table SHALL use alternating row background colors for improved readability
2. THE Parts_Page table and Orders_Page table SHALL display column headers with uppercase text styling and a bottom border separator
3. WHEN the Admin hovers over a table row, THE Dashboard SHALL display a subtle background color change with a smooth transition

### Requirement 5: Orders Search

**User Story:** As an Admin, I want to search orders by order number or shop name, so that I can quickly find specific orders.

#### Acceptance Criteria

1. THE Orders_Page SHALL display a search input field above the orders table
2. WHEN the Admin types in the search field, THE Orders_Page SHALL filter the displayed orders to show only orders where the order number or shop name contains the search text
3. THE Orders_Page SHALL perform the search filtering on the client side using the already-fetched orders data

### Requirement 6: Low Stock Indicators on Parts Page

**User Story:** As an Admin, I want to see clear visual warnings for parts with low stock, so that I can take action before items run out.

#### Acceptance Criteria

1. WHEN a part has stock at or below 5 units, THE Parts_Page SHALL display a warning icon next to the stock badge for that part
2. WHEN a part has stock equal to 0, THE Parts_Page SHALL display the stock badge with a red background and "نفذ المخزون" (Out of Stock) text
3. THE Parts_Page SHALL display a summary count of low-stock parts above the table when at least one part has stock at or below 5 units

### Requirement 7: Order Total Column in Orders List

**User Story:** As an Admin, I want to see the total value of each order in the orders list, so that I can assess order sizes without opening each one.

#### Acceptance Criteria

1. THE Orders_Page table SHALL display an additional column labeled "الإجمالي" (Total) showing the sum of (quantity × unitPrice) for all items in each order
2. THE Orders_Page SHALL format the total value with 2 decimal places followed by "ر.س" (SAR currency)

### Requirement 8: Empty States and Loading Improvements

**User Story:** As an Admin, I want to see informative empty states and smooth loading indicators, so that the dashboard feels responsive and complete.

#### Acceptance Criteria

1. WHEN data is loading, THE Dashboard SHALL display a centered spinner animation with a loading text label on all pages
2. WHEN no data is available, THE Dashboard SHALL display an illustrative empty state message with a relevant icon on the Parts_Page, Orders_Page, and Analytics_Page
3. IF a network request fails, THEN THE Dashboard SHALL display an error message with a "إعادة المحاولة" (Retry) button

### Requirement 9: Responsive Header Enhancements

**User Story:** As an Admin, I want the top header to show useful context information, so that I always know where I am and who I'm logged in as.

#### Acceptance Criteria

1. THE Dashboard header SHALL display the current page title on the left side (right side in RTL)
2. THE Dashboard header SHALL display the logged-in Admin username and role badge next to the logout button
3. THE Dashboard header SHALL display a greeting message based on time of day ("صباح الخير" for morning, "مساء الخير" for afternoon/evening)


### Requirement 10: Catalog Page — Cart Indicator on Part Cards

**User Story:** As a Shop user, I want to see which parts are already in my cart and their quantities while browsing the catalog, so that I avoid adding duplicates unintentionally.

#### Acceptance Criteria

1. WHEN a part is present in the cart, THE Catalog_Page SHALL display a Cart_Indicator badge on that part's card showing the current quantity in the cart
2. WHEN a part is not in the cart, THE Catalog_Page SHALL display the standard "أضف للسلة" (Add to Cart) button without a Cart_Indicator
3. WHEN a part is already in the cart and the Shop user clicks the add button, THE Catalog_Page SHALL increment the quantity by 1 and update the Cart_Indicator immediately
4. THE Cart_Indicator SHALL be visually distinct from the stock badge using a different color (blue) to avoid confusion

### Requirement 11: Catalog Page — Quick View Modal

**User Story:** As a Shop user, I want to view full details of a part without leaving the catalog page, so that I can make informed purchasing decisions faster.

#### Acceptance Criteria

1. WHEN the Shop user clicks on a part card in the Catalog_Page, THE Shop_App SHALL open a Quick_View_Modal displaying the part's full details: name, part number, price, stock quantity, full description, and image
2. THE Quick_View_Modal SHALL include an "أضف للسلة" (Add to Cart) button that adds the part to the cart
3. WHEN the Shop user clicks outside the Quick_View_Modal or presses the Escape key, THE Shop_App SHALL close the Quick_View_Modal
4. THE Quick_View_Modal SHALL display the exact stock quantity as a number (e.g., "المخزون: 15 قطعة")
5. WHEN a part has zero stock, THE Quick_View_Modal SHALL disable the Add to Cart button and display "نفذ المخزون" (Out of Stock)

### Requirement 12: Catalog Page — Exact Stock Count Display

**User Story:** As a Shop user, I want to see the exact stock quantity on each part card, so that I know how many units are available before ordering.

#### Acceptance Criteria

1. THE Catalog_Page SHALL display the numeric stock quantity on each part card (e.g., "المخزون: 15")
2. WHEN a part has stock between 1 and 5 units, THE Catalog_Page SHALL display the stock count with an amber/warning color and "كمية محدودة" (Limited Quantity) label
3. WHEN a part has zero stock, THE Catalog_Page SHALL display "نفذ المخزون" (Out of Stock) with a red color and disable the Add to Cart button for that part

### Requirement 13: Login Page — Auto-Redirect for Authenticated Users

**User Story:** As a Shop user who is already logged in, I want to be automatically redirected to the catalog when I visit the login page, so that I do not see the login form unnecessarily.

#### Acceptance Criteria

1. WHEN an authenticated Shop user navigates to the Shop_Login_Page, THE Shop_App SHALL redirect the user to the Catalog_Page automatically
2. WHILE the Shop_App is checking authentication status, THE Shop_Login_Page SHALL display a loading spinner instead of the login form
3. WHEN the user is not authenticated, THE Shop_Login_Page SHALL display the login form as normal

### Requirement 14: Login Page — Client-Side Validation Feedback

**User Story:** As a Shop user, I want to see clear validation messages when I submit the login form with empty fields, so that I understand what needs to be corrected.

#### Acceptance Criteria

1. WHEN the Shop user submits the login form with an empty username field, THE Shop_Login_Page SHALL display a validation message "يرجى إدخال اسم المستخدم" (Please enter username) below the username field
2. WHEN the Shop user submits the login form with an empty password field, THE Shop_Login_Page SHALL display a validation message "يرجى إدخال كلمة المرور" (Please enter password) below the password field
3. WHEN the Shop user starts typing in a field that has a validation error, THE Shop_Login_Page SHALL clear the validation message for that field immediately
4. THE Shop_Login_Page SHALL perform client-side validation before sending any request to the backend

### Requirement 15: Shop Header — Shop Name and Welcome Message

**User Story:** As a Shop user, I want to see my shop name and a welcome greeting in the header, so that the experience feels personalized.

#### Acceptance Criteria

1. THE Shop_Header SHALL display the logged-in Shop user's shopName next to the logout button
2. WHEN the Shop user's shopName is available, THE Shop_Header SHALL display a greeting "أهلاً، [shopName]" (Welcome, [shopName])
3. WHEN the Shop user's shopName is not available, THE Shop_Header SHALL display the username as a fallback in the greeting
4. THE Shop_Header SHALL display the greeting on desktop viewports and hide the greeting on mobile viewports to conserve space

### Requirement 16: Cart Page — Order Submission Confirmation Dialog

**User Story:** As a Shop user, I want to confirm my order before it is submitted, so that I can review the total and avoid accidental submissions.

#### Acceptance Criteria

1. WHEN the Shop user clicks the "إرسال الطلب" (Submit Order) button, THE Cart_Page SHALL display an Order_Confirmation_Dialog showing the total amount and number of items
2. THE Order_Confirmation_Dialog SHALL include a "تأكيد" (Confirm) button and an "إلغاء" (Cancel) button
3. WHEN the Shop user clicks "تأكيد" in the Order_Confirmation_Dialog, THE Cart_Page SHALL proceed with submitting the order to the backend
4. WHEN the Shop user clicks "إلغاء" or clicks outside the Order_Confirmation_Dialog, THE Cart_Page SHALL close the dialog without submitting the order
