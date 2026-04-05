# Tasks: Business Upgrade Enhancements

## Phase 1: MongoDB Migration Setup

### 1.1 Install MongoDB Dependencies
- [x] 1.1.1 Install mongoose package in backend
- [x] 1.1.2 Install @nestjs/mongoose package in backend
- [x] 1.1.3 Update package.json with new dependencies
- [x] 1.1.4 Remove typeorm, @nestjs/typeorm, better-sqlite3 from package.json

### 1.2 Create MongoDB Schemas
- [x] 1.2.1 Create Part schema with Mongoose (without imageUrl field)
- [x] 1.2.2 Create Order schema with Mongoose
- [x] 1.2.3 Create OrderItem schema with Mongoose
- [x] 1.2.4 Create User schema with Mongoose
- [x] 1.2.5 Add timestamps to all schemas (createdAt, updatedAt)

### 1.3 Update Database Module
- [x] 1.3.1 Replace TypeORM configuration with Mongoose configuration
- [x] 1.3.2 Add MongoDB connection string to environment variables
- [x] 1.3.3 Configure MongooseModule.forRoot with connection string
- [x] 1.3.4 Set database name to 'spare-parts-system'

### 1.4 Update Service Layers
- [x] 1.4.1 Update PartsService to use Mongoose Part model
- [x] 1.4.2 Update OrdersService to use Mongoose Order model
- [x] 1.4.3 Update UsersService to use Mongoose User model
- [x] 1.4.4 Update AuthService to work with Mongoose User model
- [x] 1.4.5 Replace TypeORM repository methods with Mongoose methods

### 1.5 Create Migration Script
- [x] 1.5.1 Create migration script file (migrate-to-mongodb.ts)
- [x] 1.5.2 Implement SQLite connection in migration script
- [x] 1.5.3 Implement MongoDB connection in migration script
- [x] 1.5.4 Migrate users from SQLite to MongoDB
- [x] 1.5.5 Migrate parts from SQLite to MongoDB (exclude imageUrl)
- [x] 1.5.6 Migrate orders from SQLite to MongoDB
- [x] 1.5.7 Migrate order items from SQLite to MongoDB
- [x] 1.5.8 Add migration summary logging
- [x] 1.5.9 Test migration script with sample data

## Phase 2: Remove Product Images

### 2.1 Backend Image Removal
- [x] 2.1.1 Remove imageUrl field from Part schema
- [x] 2.1.2 Remove imageUrl from CreatePartDto
- [x] 2.1.3 Remove imageUrl from UpdatePartDto
- [x] 2.1.4 Remove any image upload handling code in PartsController
- [x] 2.1.5 Remove any image storage/file system code

### 2.2 Shop Portal Image Removal
- [x] 2.2.1 Remove Image component imports from catalog page
- [x] 2.2.2 Remove image display from product cards
- [x] 2.2.3 Remove image display from QuickViewModal
- [x] 2.2.4 Remove imageUrl references from Part type definition
- [x] 2.2.5 Remove image error handling state (imgErrors)
- [x] 2.2.6 Update card layout to work without images

### 2.3 Admin Dashboard Image Removal
- [x] 2.3.1 Remove imageUrl field from PartFormModal
- [x] 2.3.2 Remove imageUrl from Part type definition in dashboard
- [x] 2.3.3 Remove any image upload inputs from part form
- [x] 2.3.4 Remove image preview components if any

## Phase 3: Dynamic Dashboard Data

### 3.1 Create Analytics Service
- [x] 3.1.1 Create AnalyticsService in backend
- [x] 3.1.2 Implement getTotalOrders() using countDocuments
- [x] 3.1.3 Implement getPendingOrdersCount() using countDocuments with filter
- [x] 3.1.4 Implement getTotalRevenue() using MongoDB aggregation
- [x] 3.1.5 Implement getTotalParts() using countDocuments
- [x] 3.1.6 Implement getStatusBreakdown() using aggregation
- [x] 3.1.7 Implement getTopSellingParts() using aggregation
- [x] 3.1.8 Implement getCategoryBreakdown() using aggregation
- [x] 3.1.9 Implement getLowStockParts() with threshold parameter

### 3.2 Create Analytics Controller
- [x] 3.2.1 Create AnalyticsController in backend
- [x] 3.2.2 Add GET /analytics/dashboard endpoint
- [x] 3.2.3 Add GET /analytics/top-selling endpoint
- [x] 3.2.4 Add GET /analytics/categories endpoint
- [x] 3.2.5 Add authentication guard to analytics endpoints

### 3.3 Update Dashboard Frontend
- [x] 3.3.1 Update AnalyticsPage to fetch data from /analytics/dashboard
- [x] 3.3.2 Remove hardcoded KPI calculations
- [x] 3.3.3 Use real-time data for all KPI cards
- [x] 3.3.4 Use real-time data for status breakdown
- [x] 3.3.5 Use real-time data for top selling parts
- [x] 3.3.6 Use real-time data for category breakdown
- [x] 3.3.7 Add loading states for analytics data
- [x] 3.3.8 Add error handling for analytics API calls

## Phase 4: Excel Import Functionality

### 4.1 Install Excel Dependencies
- [x] 4.1.1 Install xlsx package in backend
- [x] 4.1.2 Install @types/xlsx in backend (dev dependency)
- [x] 4.1.3 Verify multer is available (included in NestJS)

### 4.2 Create Excel Service
- [x] 4.2.1 Create ExcelService in backend
- [x] 4.2.2 Implement parseExcelFile() method
- [x] 4.2.3 Implement validateRow() method with Arabic error messages
- [x] 4.2.4 Implement validateRows() method
- [x] 4.2.5 Implement importParts() method with bulk operations
- [x] 4.2.6 Implement generateTemplate() method
- [x] 4.2.7 Add error handling for invalid file formats
- [x] 4.2.8 Add error handling for empty files

### 4.3 Update Parts Controller
- [x] 4.3.1 Add POST /parts/import endpoint
- [x] 4.3.2 Add FileInterceptor for file upload
- [x] 4.3.3 Add file validation (type, size)
- [x] 4.3.4 Call ExcelService.importParts()
- [x] 4.3.5 Return import summary response
- [x] 4.3.6 Add GET /parts/template endpoint
- [x] 4.3.7 Return Excel template file with proper headers
- [x] 4.3.8 Add admin authentication guard to import endpoints

### 4.4 Create Import UI Component
- [x] 4.4.1 Create ExcelImportModal component in dashboard
- [x] 4.4.2 Add file input with accept=".xlsx,.xls"
- [x] 4.4.3 Add "تحميل القالب" (Download Template) button
- [x] 4.4.4 Add "استيراد" (Import) button
- [x] 4.4.5 Implement file selection handling
- [x] 4.4.6 Implement template download handling
- [x] 4.4.7 Implement import API call with FormData
- [x] 4.4.8 Display import progress indicator
- [x] 4.4.9 Display import summary on success
- [x] 4.4.10 Display error details on failure
- [x] 4.4.11 Add file size validation (max 10MB)
- [x] 4.4.12 Add file type validation

### 4.5 Integrate Import UI
- [x] 4.5.1 Add "استيراد من Excel" button to PartsListPage
- [x] 4.5.2 Open ExcelImportModal on button click
- [x] 4.5.3 Refresh parts list after successful import
- [x] 4.5.4 Show success toast notification
- [x] 4.5.5 Show error toast notification

## Phase 5: Shop Portal UI Modernization

### 5.1 Modernize Product Cards
- [x] 5.1.1 Update card layout with modern styling
- [x] 5.1.2 Add hover effects and animations
- [x] 5.1.3 Improve card spacing and padding
- [x] 5.1.4 Add shadow effects on hover
- [x] 5.1.5 Update typography for better readability
- [x] 5.1.6 Add smooth transitions for interactive elements
- [x] 5.1.7 Ensure cards work without images

### 5.2 Enhance Search Functionality
- [x] 5.2.1 Update search bar styling
- [x] 5.2.2 Add search icon
- [x] 5.2.3 Add clear button (X icon)
- [x] 5.2.4 Implement debounced search (500ms)
- [x] 5.2.5 Display search result count
- [x] 5.2.6 Add loading indicator during search
- [x] 5.2.7 Improve search placeholder text

### 5.3 Create Page Navigation Selector
- [x] 5.3.1 Create navigation component for Catalog/Orders
- [x] 5.3.2 Add active page indicator
- [x] 5.3.3 Style navigation with modern design
- [x] 5.3.4 Add smooth transitions between pages
- [x] 5.3.5 Integrate navigation into AppLayout

### 5.4 Modernize Navbar
- [x] 5.4.1 Decide on navbar style (side panel vs horizontal)
- [x] 5.4.2 Increase navbar size and improve spacing
- [x] 5.4.3 Update navbar typography
- [x] 5.4.4 Add cart indicator badge
- [x] 5.4.5 Improve navbar responsiveness
- [x] 5.4.6 Add smooth animations for navbar interactions
- [x] 5.4.7 Update navbar colors and contrast

### 5.5 Improve Filter UI
- [x] 5.5.1 Update category filter chips styling
- [x] 5.5.2 Update brand filter chips styling
- [x] 5.5.3 Update price range filter styling
- [x] 5.5.4 Add active filter indicators
- [x] 5.5.5 Add "Clear all filters" button
- [x] 5.5.6 Improve filter panel layout
- [x] 5.5.7 Add filter count badge

### 5.6 Responsive Design Updates
- [x] 5.6.1 Test and fix mobile layout (320px-640px)
- [x] 5.6.2 Test and fix tablet layout (641px-1024px)
- [x] 5.6.3 Test and fix desktop layout (1025px+)
- [x] 5.6.4 Ensure touch targets are adequate (min 44px)
- [x] 5.6.5 Test navigation on mobile devices
- [x] 5.6.6 Test filters on mobile devices

## Phase 6: Business Enhancement Features (Optional)

### 6.1 Order History & Reordering
- [ ] 6.1.1 Create order history view for shops
- [ ] 6.1.2 Add "Reorder" button to past orders
- [ ] 6.1.3 Implement reorder functionality (copy items to cart)
- [ ] 6.1.4 Add order detail view from history
- [ ] 6.1.5 Add date filtering for order history

### 6.2 Bulk Order Discounts
- [ ] 6.2.1 Create discount calculation service
- [ ] 6.2.2 Implement 5% discount for >10 parts
- [ ] 6.2.3 Implement 10% discount for >50 parts
- [ ] 6.2.4 Display discount information in cart
- [ ] 6.2.5 Apply discount to order total
- [ ] 6.2.6 Show discount breakdown in order summary

### 6.3 Low Stock Notifications
- [ ] 6.3.1 Create notification service
- [ ] 6.3.2 Identify frequently ordered parts per shop
- [ ] 6.3.3 Check stock levels for frequent parts
- [ ] 6.3.4 Send in-app notifications for low stock
- [ ] 6.3.5 Add notification center to shop portal
- [ ] 6.3.6 (Optional) Implement email notifications

## Phase 7: Testing & Quality Assurance

### 7.1 Unit Tests
- [~] 7.1.1 Write tests for ExcelService.parseExcelFile()
- [~] 7.1.2 Write tests for ExcelService.validateRow()
- [~] 7.1.3 Write tests for ExcelService.importParts()
- [~] 7.1.4 Write tests for AnalyticsService methods
- [~] 7.1.5 Write tests for Mongoose schemas validation
- [~] 7.1.6 Write tests for PartsService with MongoDB
- [~] 7.1.7 Write tests for OrdersService with MongoDB

### 7.2 Integration Tests
- [~] 7.2.1 Test Excel import end-to-end
- [~] 7.2.2 Test MongoDB migration script
- [~] 7.2.3 Test dashboard analytics API
- [~] 7.2.4 Test shop portal catalog with MongoDB
- [~] 7.2.5 Test order creation with MongoDB

### 7.3 UI/UX Testing
- [~] 7.3.1 Test Excel import UI flow
- [~] 7.3.2 Test template download
- [~] 7.3.3 Test error message display
- [~] 7.3.4 Test shop portal navigation
- [~] 7.3.5 Test product card interactions
- [~] 7.3.6 Test search functionality
- [~] 7.3.7 Test filter functionality
- [~] 7.3.8 Test responsive design on multiple devices

### 7.4 Performance Testing
- [~] 7.4.1 Test Excel import with 1000 rows
- [~] 7.4.2 Test dashboard load time
- [~] 7.4.3 Test search response time
- [~] 7.4.4 Test MongoDB query performance
- [~] 7.4.5 Optimize slow queries with indexes

### 7.5 Security Testing
- [~] 7.5.1 Test file upload validation
- [~] 7.5.2 Test file size limits
- [~] 7.5.3 Test authentication on protected endpoints
- [~] 7.5.4 Test input sanitization
- [~] 7.5.5 Verify connection string is in environment variables

## Phase 8: Documentation & Deployment

### 8.1 Documentation
- [x] 8.1.1 Document MongoDB connection setup
- [x] 8.1.2 Document migration script usage
- [x] 8.1.3 Document Excel import API endpoints
- [x] 8.1.4 Document Excel template format
- [x] 8.1.5 Document analytics API endpoints
- [x] 8.1.6 Update README with new dependencies
- [x] 8.1.7 Create user guide for Excel import (Arabic)

### 8.2 Environment Configuration
- [x] 8.2.1 Add MONGODB_URI to .env.example
- [x] 8.2.2 Add MONGODB_DB_NAME to .env.example
- [x] 8.2.3 Add MAX_EXCEL_FILE_SIZE to .env.example
- [x] 8.2.4 Document environment variables in README

### 8.3 Deployment Preparation
- [x] 8.3.1 Run migration script on production data
- [x] 8.3.2 Verify all data migrated correctly
- [x] 8.3.3 Test production MongoDB connection
- [x] 8.3.4 Create database backup before deployment
- [x] 8.3.5 Deploy backend with MongoDB
- [x] 8.3.6 Deploy updated dashboard
- [x] 8.3.7 Deploy updated shop portal
- [x] 8.3.8 Verify all features work in production

### 8.4 Post-Deployment
- [x] 8.4.1 Monitor MongoDB performance
- [x] 8.4.2 Monitor error logs
- [x] 8.4.3 Collect user feedback on Excel import
- [x] 8.4.4 Collect user feedback on UI changes
- [x] 8.4.5 Address any issues or bugs
