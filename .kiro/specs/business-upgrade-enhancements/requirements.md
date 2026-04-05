# Requirements Document: Business Upgrade Enhancements

## 1. Functional Requirements

### 1.1 Image Removal

#### 1.1.1 Database Schema Update
The system SHALL remove the imageUrl field from the Part entity schema in both the database and codebase.

#### 1.1.2 Frontend Image Display Removal
The system SHALL remove all image display components and references from:
- Shop portal product catalog
- Shop portal product detail views
- Admin dashboard parts list
- Admin dashboard part form

#### 1.1.3 Data Migration
The system SHALL ensure existing imageUrl data is not migrated to the new MongoDB database.

### 1.2 MongoDB Migration

#### 1.2.1 Database Connection
The system SHALL replace TypeORM with Mongoose for MongoDB connectivity.

#### 1.2.2 Connection String Configuration
The system SHALL use the provided MongoDB Atlas connection string: `mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0`

#### 1.2.3 Schema Definition
The system SHALL define Mongoose schemas for:
- Part (without imageUrl field)
- Order
- OrderItem
- User

#### 1.2.4 Data Migration Script
The system SHALL provide a migration script that transfers all existing data from SQLite to MongoDB, excluding imageUrl fields.

#### 1.2.5 Frontend Connection Compatibility
The system SHALL ensure all frontend API calls (dashboard and shop portal) work correctly with the MongoDB backend.

### 1.3 Dynamic Dashboard Data

#### 1.3.1 Real-Time KPI Calculation
The system SHALL compute all dashboard KPIs from real-time MongoDB queries:
- Total orders count
- Pending orders count
- Total revenue sum
- Total parts count

#### 1.3.2 Status Breakdown
The system SHALL provide real-time order status breakdown using MongoDB aggregation.

#### 1.3.3 Top Selling Parts
The system SHALL calculate top-selling parts dynamically from order items data.

#### 1.3.4 Category Statistics
The system SHALL compute category breakdown (count and stock) from parts collection.

#### 1.3.5 Low Stock Alerts
The system SHALL identify low-stock parts dynamically based on current stock levels.

### 1.4 Excel Import for Parts

#### 1.4.1 File Upload Interface
The admin dashboard SHALL provide a file upload button for Excel import with Arabic label "استيراد من Excel".

#### 1.4.2 Template Download
The admin dashboard SHALL provide a "تحميل القالب" (Download Template) button that generates an Excel template file.

#### 1.4.3 Template Structure
The Excel template SHALL include:
- Header row with Arabic column names
- Required columns: رقم القطعة (partNumber), الاسم (name), السعر (price), المخزون (stock)
- Optional columns: الوصف (description), التصنيف (category), الماركة (brand)
- One example row with sample data

#### 1.4.4 Required Field Validation
The system SHALL validate that each Excel row contains:
- Non-empty partNumber
- Non-empty name
- Positive price (number)
- Non-negative stock (integer)

#### 1.4.5 Optional Field Handling
The system SHALL accept optional fields (description, category, brand) and use empty strings if not provided.

#### 1.4.6 Duplicate Handling
The system SHALL update existing parts when partNumber already exists in the database.

#### 1.4.7 Error Reporting
The system SHALL provide detailed error messages in Arabic for:
- Invalid file format
- Missing required fields
- Invalid data types
- Invalid value ranges

#### 1.4.8 Import Summary
The system SHALL display an import summary showing:
- Total rows processed
- Successfully imported count
- Successfully updated count
- Failed count
- List of errors with row numbers

#### 1.4.9 Non-Technical User Support
The system SHALL provide clear, user-friendly error messages suitable for non-technical users.

### 1.5 Shop Portal UI Modernization

#### 1.5.1 Card-Based Product Display
The shop portal SHALL display products in a modern card layout with:
- Product information (name, part number, price, stock)
- Category and brand badges
- Stock status indicators
- Add to cart button
- Hover effects and animations

#### 1.5.2 Enhanced Search
The shop portal SHALL provide improved search functionality:
- Search by part number, name, or brand
- Real-time search results (debounced)
- Clear search button
- Search result count display

#### 1.5.3 Page Navigation Selector
The shop portal SHALL provide a selector/navigation for:
- Main catalog page
- My Orders page
- Clear active page indication

#### 1.5.4 Modern Navbar Design
The shop portal SHALL implement a modernized navbar with one of these options:
- Side navigation panel (drawer/sidebar)
- Larger horizontal navbar with improved styling
- Better visual hierarchy and spacing
- Cart indicator badge

#### 1.5.5 Responsive Design
The shop portal UI SHALL be fully responsive for mobile, tablet, and desktop devices.

#### 1.5.6 Filter Improvements
The shop portal SHALL provide enhanced filtering:
- Category filter chips
- Brand filter chips
- Price range filters
- Active filter indicators
- Clear all filters option

### 1.6 Business Enhancement Features (Suggested)

#### 1.6.1 Order History & Reordering
The system SHOULD allow shops to:
- View their complete order history
- Reorder previous orders with one click
- View order details from history

#### 1.6.2 Bulk Order Discounts
The system SHOULD automatically apply discounts based on order quantity:
- 5% discount for orders >10 parts
- 10% discount for orders >50 parts
- Display discount information to users

#### 1.6.3 Low Stock Notifications
The system SHOULD notify shops when frequently ordered parts are low in stock via:
- In-app notifications
- Email notifications (optional)

## 2. Non-Functional Requirements

### 2.1 Performance

#### 2.1.1 Excel Import Performance
The system SHALL import 1000 parts in less than 10 seconds.

#### 2.1.2 Dashboard Load Time
The dashboard SHALL load all analytics data in less than 2 seconds.

#### 2.1.3 Search Responsiveness
The shop portal search SHALL respond within 500ms of user input (with debouncing).

#### 2.1.4 Database Query Optimization
The system SHALL use appropriate MongoDB indexes for frequently queried fields (partNumber, status, createdAt).

### 2.2 Security

#### 2.2.1 File Upload Validation
The system SHALL validate uploaded files:
- Accept only .xlsx and .xls formats
- Limit file size to 10MB maximum
- Reject invalid file types with clear error message

#### 2.2.2 Connection String Security
The system SHALL store the MongoDB connection string in environment variables, never in source code.

#### 2.2.3 Authentication
The system SHALL require admin authentication for Excel import functionality.

#### 2.2.4 Input Sanitization
The system SHALL sanitize all Excel input data to prevent injection attacks.

### 2.3 Reliability

#### 2.3.1 Error Recovery
The system SHALL handle errors gracefully:
- MongoDB connection failures
- Invalid Excel files
- Network timeouts
- Provide clear error messages to users

#### 2.3.2 Data Integrity
The system SHALL maintain data integrity during:
- Excel imports (validate before inserting)
- Database migrations (verify completeness)
- Concurrent operations (use MongoDB transactions where appropriate)

### 2.4 Usability

#### 2.4.1 Arabic Language Support
All user-facing messages, labels, and error messages SHALL be in Arabic.

#### 2.4.2 Non-Technical User Friendly
Error messages and instructions SHALL be clear and understandable for non-technical users.

#### 2.4.3 Visual Feedback
The system SHALL provide visual feedback for:
- File upload progress
- Import operation progress
- Success/failure states
- Loading states

### 2.5 Maintainability

#### 2.5.1 Code Organization
The system SHALL organize code into clear modules:
- Excel service (parsing, validation, import)
- Analytics service (dashboard calculations)
- MongoDB schemas (separate files per entity)

#### 2.5.2 Documentation
The system SHALL include:
- API documentation for new endpoints
- Schema documentation for MongoDB models
- Migration guide from SQLite to MongoDB

### 2.6 Compatibility

#### 2.6.1 Browser Support
The shop portal and admin dashboard SHALL support:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

#### 2.6.2 Node.js Version
The backend SHALL run on Node.js version 20.0.0 or higher.

#### 2.6.3 MongoDB Version
The system SHALL be compatible with MongoDB 6.0 or higher.

## 3. Constraints

### 3.1 Technical Constraints

#### 3.1.1 MongoDB Atlas
The system MUST use MongoDB Atlas cloud service with the provided connection string.

#### 3.1.2 Existing Technology Stack
The system MUST maintain:
- NestJS for backend
- React/Vite for admin dashboard
- Next.js for shop portal

#### 3.1.3 Excel Format
The system MUST support .xlsx and .xls file formats only.

### 3.2 Business Constraints

#### 3.2.1 No Product Images
The system MUST NOT include product images as per client requirement.

#### 3.2.2 Arabic Interface
All user interfaces MUST be in Arabic language.

#### 3.2.3 Non-Technical Users
The system MUST be usable by non-technical users, particularly for Excel import functionality.

## 4. Acceptance Criteria

### 4.1 Image Removal Acceptance

- [ ] Part schema does not contain imageUrl field
- [ ] No frontend component displays or references images
- [ ] Existing imageUrl data is not migrated to MongoDB
- [ ] All image-related code is removed from codebase

### 4.2 MongoDB Migration Acceptance

- [ ] Backend connects successfully to MongoDB Atlas
- [ ] All entities (User, Part, Order) are defined as Mongoose schemas
- [ ] Migration script successfully transfers all SQLite data to MongoDB
- [ ] Dashboard frontend displays data from MongoDB
- [ ] Shop portal frontend displays data from MongoDB
- [ ] All API endpoints work correctly with MongoDB

### 4.3 Dynamic Dashboard Acceptance

- [ ] Total orders count is computed from MongoDB
- [ ] Pending orders count is computed from MongoDB
- [ ] Total revenue is computed from MongoDB aggregation
- [ ] Total parts count is computed from MongoDB
- [ ] Status breakdown uses MongoDB aggregation
- [ ] Top selling parts are calculated dynamically
- [ ] Category breakdown is calculated dynamically
- [ ] No hardcoded numbers remain in dashboard

### 4.4 Excel Import Acceptance

- [ ] Admin dashboard has "استيراد من Excel" button
- [ ] Admin dashboard has "تحميل القالب" button
- [ ] Template download generates valid Excel file with Arabic headers
- [ ] Template includes example row with sample data
- [ ] System validates required fields (partNumber, name, price, stock)
- [ ] System accepts optional fields (description, category, brand)
- [ ] System updates existing parts when partNumber matches
- [ ] System creates new parts when partNumber is unique
- [ ] System displays import summary with counts
- [ ] System displays detailed errors in Arabic for invalid rows
- [ ] System handles invalid file formats gracefully
- [ ] System handles empty Excel files gracefully
- [ ] Import completes in <10 seconds for 1000 rows

### 4.5 Shop Portal UI Acceptance

- [ ] Products display in modern card layout
- [ ] Cards show product info, badges, and stock status
- [ ] Cards have hover effects and animations
- [ ] Search bar searches by part number, name, and brand
- [ ] Search results update in real-time (debounced)
- [ ] Search result count is displayed
- [ ] Navigation selector shows "Catalog" and "My Orders" options
- [ ] Active page is clearly indicated
- [ ] Navbar is modernized (side panel or larger horizontal)
- [ ] Cart indicator badge is visible
- [ ] Category filter chips are functional
- [ ] Brand filter chips are functional
- [ ] Price range filters are functional
- [ ] Active filters are indicated
- [ ] "Clear all filters" option works
- [ ] UI is responsive on mobile, tablet, and desktop

### 4.6 Business Enhancement Acceptance (Optional)

- [ ] Shops can view their order history
- [ ] Shops can reorder previous orders with one click
- [ ] Bulk discounts are applied automatically (5% >10 parts, 10% >50 parts)
- [ ] Low stock notifications are sent to shops

## 5. Dependencies and Assumptions

### 5.1 Dependencies

- MongoDB Atlas cluster is accessible and operational
- Provided connection string has appropriate permissions (read/write)
- Excel files uploaded by users follow standard Excel format
- Existing SQLite database is available for migration

### 5.2 Assumptions

- Users have basic computer literacy (can upload files, click buttons)
- Network connectivity is stable for MongoDB Atlas access
- Admin users have appropriate permissions for Excel import
- Shop users are authenticated before accessing catalog
- Excel files will not exceed 10MB in size
- Excel files will not contain more than 10,000 rows (reasonable limit)
