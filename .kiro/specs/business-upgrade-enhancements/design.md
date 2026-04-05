# Design Document: Business Upgrade Enhancements

## Overview

This design covers five major business enhancements to the spare parts ordering system: (1) removing product images from the database and codebase, (2) modernizing the shop portal UI with card-based designs and improved navigation, (3) migrating from SQLite to MongoDB with dynamic dashboard data, (4) adding Excel import functionality for bulk part entry in the admin dashboard, and (5) researching and suggesting practical business features for spare parts operations.

The system currently uses NestJS with TypeORM (SQLite), React/Vite for the admin dashboard, and Next.js for the shop portal. The migration will replace TypeORM with Mongoose for MongoDB integration while maintaining all existing functionality.

## Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        SP[Shop Portal - Next.js]
        AD[Admin Dashboard - React/Vite]
    end
    
    subgraph "Backend Layer - NestJS"
        API[REST API Controllers]
        AUTH[Auth Service]
        PARTS[Parts Service]
        ORDERS[Orders Service]
        EXCEL[Excel Import Service]
    end
    
    subgraph "Data Layer"
        MONGO[(MongoDB Atlas)]
    end
    
    SP -->|HTTP/REST| API
    AD -->|HTTP/REST| API
    API --> AUTH
    API --> PARTS
    API --> ORDERS
    API --> EXCEL
    AUTH --> MONGO
    PARTS --> MONGO
    ORDERS --> MONGO
    EXCEL --> PARTS
    
    style MONGO fill:#47A248
    style EXCEL fill:#FFD700
```

## Main Workflow: Excel Import

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant UI as Dashboard UI
    participant API as Backend API
    participant Excel as Excel Service
    participant Validation as Validator
    participant DB as MongoDB
    
    Admin->>UI: Click "Import from Excel"
    UI->>Admin: Show file picker
    Admin->>UI: Select Excel file
    UI->>API: POST /parts/import (multipart/form-data)
    API->>Excel: Parse Excel file
    Excel->>Excel: Read rows
    Excel->>Validation: Validate each row
    
    alt Validation passes
        Validation->>Excel: Valid rows
        Excel->>DB: Bulk insert/update parts
        DB->>Excel: Success
        Excel->>API: Import summary
        API->>UI: 200 OK + summary
        UI->>Admin: Show success message
    else Validation fails
        Validation->>Excel: Error details
        Excel->>API: Validation errors
        API->>UI: 400 Bad Request + errors
        UI->>Admin: Show error details
    end

```

## Components and Interfaces

### Component 1: MongoDB Connection Module

**Purpose**: Replace TypeORM SQLite configuration with Mongoose MongoDB connection

**Interface**:
```typescript
// database.module.ts
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: 'spare-parts-system',
      retryWrites: true,
      w: 'majority'
    })
  ]
})
export class DatabaseModule {}
```

**Responsibilities**:
- Establish connection to MongoDB Atlas
- Handle connection pooling and retry logic
- Provide connection to all modules

### Component 2: Excel Import Service

**Purpose**: Parse Excel files and bulk import parts data with validation

**Interface**:
```typescript
interface ExcelImportService {
  parseExcelFile(file: Express.Multer.File): Promise<ParsedRow[]>
  validateRows(rows: ParsedRow[]): ValidationResult
  importParts(validRows: ParsedRow[]): Promise<ImportSummary>
  generateTemplate(): Buffer
}

interface ParsedRow {
  partNumber: string
  name: string
  price: number
  stock: number
  description?: string
  category?: string
  brand?: string
}

interface ValidationResult {
  valid: ParsedRow[]
  errors: RowError[]
}

interface RowError {
  row: number
  field: string
  message: string
  value: any
}

interface ImportSummary {
  totalRows: number
  imported: number
  updated: number
  failed: number
  errors: RowError[]
}
```

**Responsibilities**:
- Parse Excel files using xlsx library
- Validate required fields (partNumber, name, price, stock)
- Handle duplicate part numbers (update existing)
- Provide detailed error messages for non-technical users
- Generate downloadable Excel template

### Component 3: Mongoose Schemas

**Purpose**: Define MongoDB schemas for all entities

**Interface**:
```typescript
// Part Schema
@Schema({ timestamps: true })
export class Part {
  @Prop({ required: true, unique: true })
  partNumber: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true, type: Number })
  price: number

  @Prop({ default: '' })
  description: string

  @Prop({ required: true, type: Number, default: 0 })
  stock: number

  @Prop({ default: '' })
  category: string

  @Prop({ default: '' })
  brand: string

  // imageUrl field REMOVED
}

// Order Schema
@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  shopName: string

  @Prop({ required: true })
  contactPerson: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true, enum: ['pending', 'approved', 'preparing', 'ready', 'delivered'] })
  status: string

  @Prop({ type: [OrderItemSchema] })
  items: OrderItem[]

  @Prop({ required: true, type: Number })
  totalAmount: number
}

// User Schema
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ required: true, enum: ['admin', 'shop'] })
  role: string

  @Prop()
  shopName?: string
}
```

**Responsibilities**:
- Define data structure for MongoDB collections
- Enforce validation rules at schema level
- Provide TypeScript types for type safety
- Handle timestamps automatically

### Component 4: Shop Portal UI Components

**Purpose**: Modernize shop portal with card-based product display and improved navigation

**Interface**:
```typescript
// ProductCard Component
interface ProductCardProps {
  part: Part
  onAddToCart: (part: Part) => void
  cartQuantity: number
}

// ModernNavbar Component
interface ModernNavbarProps {
  currentPage: 'catalog' | 'orders'
  onNavigate: (page: string) => void
  cartCount: number
}

// SearchBar Component
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder: string
}
```

**Responsibilities**:
- Display products in modern card layout with hover effects
- Provide intuitive navigation between catalog and orders
- Implement responsive design for mobile/tablet/desktop
- Show real-time cart indicators

### Component 5: Dynamic Analytics Service

**Purpose**: Replace static dashboard numbers with real-time MongoDB aggregations

**Interface**:
```typescript
interface AnalyticsService {
  getTotalOrders(): Promise<number>
  getPendingOrdersCount(): Promise<number>
  getTotalRevenue(): Promise<number>
  getTotalParts(): Promise<number>
  getStatusBreakdown(): Promise<Record<OrderStatus, number>>
  getTopSellingParts(limit: number): Promise<TopSellingPart[]>
  getCategoryBreakdown(): Promise<CategoryStats[]>
  getLowStockParts(threshold: number): Promise<Part[]>
}

interface TopSellingPart {
  partNumber: string
  name: string
  totalQuantity: number
  totalRevenue: number
}

interface CategoryStats {
  category: string
  count: number
  totalStock: number
}
```

**Responsibilities**:
- Perform MongoDB aggregation queries for dashboard KPIs
- Cache results for performance (optional)
- Provide real-time data updates
- Handle empty data states gracefully

## Data Models

### Model 1: Part (MongoDB Document)

```typescript
interface Part {
  _id: ObjectId
  partNumber: string        // Unique identifier
  name: string             // Display name
  price: number            // Price in SAR
  description: string      // Optional description
  stock: number            // Available quantity
  category: string         // Optional category
  brand: string            // Optional brand
  createdAt: Date          // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

**Validation Rules**:
- partNumber: Required, unique, non-empty string
- name: Required, non-empty string
- price: Required, positive number
- stock: Required, non-negative integer
- category, brand, description: Optional strings
- imageUrl: REMOVED from schema

### Model 2: Order (MongoDB Document)

```typescript
interface Order {
  _id: ObjectId
  shopName: string
  contactPerson: string
  phone: string
  status: 'pending' | 'approved' | 'preparing' | 'ready' | 'delivered'
  items: OrderItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  partNumber: string
  partName: string
  quantity: number
  unitPrice: number
}
```

**Validation Rules**:
- shopName, contactPerson, phone: Required strings
- status: Must be one of the enum values
- items: Array with at least one item
- totalAmount: Positive number, calculated from items
- Each OrderItem must have valid partNumber, quantity > 0, unitPrice > 0

### Model 3: User (MongoDB Document)

```typescript
interface User {
  _id: ObjectId
  username: string
  passwordHash: string
  role: 'admin' | 'shop'
  shopName?: string
  createdAt: Date
  updatedAt: Date
}
```

**Validation Rules**:
- username: Required, unique, non-empty string
- passwordHash: Required, bcrypt hashed password
- role: Must be 'admin' or 'shop'
- shopName: Required if role is 'shop', optional for admin

## Algorithmic Pseudocode

### Excel Import Algorithm

```typescript
async function importPartsFromExcel(file: Express.Multer.File): Promise<ImportSummary> {
  // INPUT: Excel file from multipart upload
  // OUTPUT: Summary of import operation with success/failure counts
  
  // Step 1: Parse Excel file
  const workbook = XLSX.read(file.buffer, { type: 'buffer' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(worksheet)
  
  // Step 2: Initialize counters
  let imported = 0
  let updated = 0
  let failed = 0
  const errors: RowError[] = []
  
  // Step 3: Process each row with validation
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]
    const rowNumber = i + 2 // Excel rows start at 1, header is row 1
    
    // Validate required fields
    const validation = validateRow(row, rowNumber)
    
    if (!validation.isValid) {
      failed++
      errors.push(...validation.errors)
      continue
    }
    
    // Check if part exists
    const existingPart = await Part.findOne({ partNumber: row.partNumber })
    
    if (existingPart) {
      // Update existing part
      await Part.updateOne(
        { partNumber: row.partNumber },
        {
          name: row.name,
          price: row.price,
          stock: row.stock,
          description: row.description || '',
          category: row.category || '',
          brand: row.brand || ''
        }
      )
      updated++
    } else {
      // Create new part
      await Part.create({
        partNumber: row.partNumber,
        name: row.name,
        price: row.price,
        stock: row.stock,
        description: row.description || '',
        category: row.category || '',
        brand: row.brand || ''
      })
      imported++
    }
  }
  
  return {
    totalRows: rawRows.length,
    imported,
    updated,
    failed,
    errors
  }
}
```

**Preconditions**:
- file is a valid Excel file (.xlsx or .xls)
- file.buffer contains the file data
- MongoDB connection is established

**Postconditions**:
- All valid rows are imported or updated in database
- Invalid rows are reported with specific error messages
- Summary contains accurate counts
- No partial imports (transaction-like behavior per row)

**Loop Invariants**:
- imported + updated + failed = number of processed rows
- errors.length >= failed (one or more errors per failed row)

### Row Validation Algorithm

```typescript
function validateRow(row: any, rowNumber: number): ValidationResult {
  // INPUT: Raw row data from Excel, row number for error reporting
  // OUTPUT: Validation result with isValid flag and error details
  
  const errors: RowError[] = []
  
  // Check required field: partNumber
  if (!row.partNumber || String(row.partNumber).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'partNumber',
      message: 'رقم القطعة مطلوب',
      value: row.partNumber
    })
  }
  
  // Check required field: name
  if (!row.name || String(row.name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'name',
      message: 'اسم القطعة مطلوب',
      value: row.name
    })
  }
  
  // Check required field: price
  if (row.price === undefined || row.price === null) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'السعر مطلوب',
      value: row.price
    })
  } else if (typeof row.price !== 'number' || row.price <= 0) {
    errors.push({
      row: rowNumber,
      field: 'price',
      message: 'السعر يجب أن يكون رقم موجب',
      value: row.price
    })
  }
  
  // Check required field: stock
  if (row.stock === undefined || row.stock === null) {
    errors.push({
      row: rowNumber,
      field: 'stock',
      message: 'المخزون مطلوب',
      value: row.stock
    })
  } else if (typeof row.stock !== 'number' || row.stock < 0 || !Number.isInteger(row.stock)) {
    errors.push({
      row: rowNumber,
      field: 'stock',
      message: 'المخزون يجب أن يكون رقم صحيح غير سالب',
      value: row.stock
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

**Preconditions**:
- row is an object (may contain any fields)
- rowNumber is a positive integer

**Postconditions**:
- Returns validation result with all errors found
- isValid is true if and only if errors array is empty
- Each error contains row number, field name, Arabic message, and actual value

### MongoDB Migration Algorithm

```typescript
async function migrateFromSQLiteToMongoDB(): Promise<MigrationSummary> {
  // INPUT: Existing SQLite database file
  // OUTPUT: Summary of migrated records
  
  // Step 1: Connect to both databases
  const sqliteConnection = await createSQLiteConnection()
  const mongoConnection = await createMongoConnection()
  
  // Step 2: Migrate Users
  const users = await sqliteConnection.query('SELECT * FROM user')
  for (const user of users) {
    await User.create({
      username: user.username,
      passwordHash: user.password_hash,
      role: user.role,
      shopName: user.shop_name
    })
  }
  
  // Step 3: Migrate Parts (excluding imageUrl)
  const parts = await sqliteConnection.query('SELECT * FROM part')
  for (const part of parts) {
    await Part.create({
      partNumber: part.partNumber,
      name: part.name,
      price: part.price,
      description: part.description,
      stock: part.stock,
      category: part.category,
      brand: part.brand
      // imageUrl intentionally omitted
    })
  }
  
  // Step 4: Migrate Orders
  const orders = await sqliteConnection.query('SELECT * FROM order')
  for (const order of orders) {
    const items = await sqliteConnection.query(
      'SELECT * FROM order_item WHERE orderId = ?',
      [order.id]
    )
    
    await Order.create({
      shopName: order.shopName,
      contactPerson: order.contactPerson,
      phone: order.phone,
      status: order.status,
      totalAmount: order.totalAmount,
      items: items.map(item => ({
        partNumber: item.partNumber,
        partName: item.partName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    })
  }
  
  return {
    usersCount: users.length,
    partsCount: parts.length,
    ordersCount: orders.length
  }
}
```

**Preconditions**:
- SQLite database file exists and is accessible
- MongoDB connection string is valid
- MongoDB database is empty (fresh migration)

**Postconditions**:
- All users, parts, and orders are migrated to MongoDB
- imageUrl field is not migrated (intentionally dropped)
- Relationships are preserved (order items reference parts)
- Original SQLite data remains unchanged

## Key Functions with Formal Specifications

### Function 1: generateExcelTemplate()

```typescript
function generateExcelTemplate(): Buffer
```

**Preconditions**:
- xlsx library is installed and available

**Postconditions**:
- Returns valid Excel file buffer
- File contains header row with Arabic column names
- File contains one example row with sample data
- File is downloadable by user

**Loop Invariants**: N/A (no loops)

### Function 2: removeImageReferences()

```typescript
async function removeImageReferences(): Promise<void>
```

**Preconditions**:
- Database connection is established
- Part schema exists

**Postconditions**:
- imageUrl field is removed from Part schema
- All existing imageUrl values are deleted from database
- No references to imageUrl remain in codebase
- Frontend components no longer display images

**Loop Invariants**: N/A

### Function 3: getDashboardAnalytics()

```typescript
async function getDashboardAnalytics(): Promise<DashboardData>
```

**Preconditions**:
- MongoDB connection is active
- Collections (orders, parts) exist

**Postconditions**:
- Returns real-time aggregated data
- All numbers are computed from database (no hardcoded values)
- Response includes: totalOrders, pendingOrders, totalRevenue, totalParts, statusBreakdown
- Handles empty collections gracefully (returns zeros)

**Loop Invariants**:
- For aggregation loops: accumulated totals remain consistent with processed documents

## Example Usage

### Excel Import Flow

```typescript
// Backend Controller
@Post('import')
@UseInterceptors(FileInterceptor('file'))
async importParts(@UploadedFile() file: Express.Multer.File) {
  const summary = await this.excelService.importPartsFromExcel(file)
  return {
    success: summary.failed === 0,
    message: `تم استيراد ${summary.imported} قطعة، تحديث ${summary.updated} قطعة، فشل ${summary.failed} قطعة`,
    data: summary
  }
}

// Frontend Component
async function handleFileUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await client.post('/parts/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  if (response.data.success) {
    showSuccessToast(response.data.message)
  } else {
    showErrorDialog(response.data.data.errors)
  }
}
```

### MongoDB Connection

```typescript
// app.module.ts
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0',
      {
        dbName: 'spare-parts-system'
      }
    ),
    PartsModule,
    OrdersModule,
    UsersModule
  ]
})
export class AppModule {}
```

### Dynamic Dashboard Data

```typescript
// Frontend: AnalyticsPage.tsx
useEffect(() => {
  async function fetchAnalytics() {
    const response = await client.get('/analytics/dashboard')
    setTotalOrders(response.data.totalOrders)
    setPendingOrders(response.data.pendingOrders)
    setTotalRevenue(response.data.totalRevenue)
    setTotalParts(response.data.totalParts)
    setStatusBreakdown(response.data.statusBreakdown)
  }
  fetchAnalytics()
}, [])

// Backend: AnalyticsController
@Get('dashboard')
async getDashboard() {
  const [totalOrders, pendingOrders, totalRevenue, totalParts, statusBreakdown] = await Promise.all([
    this.orderModel.countDocuments(),
    this.orderModel.countDocuments({ status: 'pending' }),
    this.orderModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    this.partModel.countDocuments(),
    this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ])
  
  return {
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalParts,
    statusBreakdown: Object.fromEntries(
      statusBreakdown.map(s => [s._id, s.count])
    )
  }
}
```

## Correctness Properties

### Property 1: Image Removal Completeness
**Universal Quantification**: ∀ part ∈ Parts, part.imageUrl = undefined ∧ ∀ component ∈ Frontend, ¬contains(component, 'imageUrl')

All parts in the database must not have an imageUrl field, and no frontend component should reference imageUrl.

### Property 2: Excel Import Atomicity
**Universal Quantification**: ∀ row ∈ ExcelRows, (isValid(row) ⟹ imported(row) ∨ updated(row)) ∧ (¬isValid(row) ⟹ reported(row))

Every valid row must be either imported or updated, and every invalid row must be reported with errors.

### Property 3: Required Field Validation
**Universal Quantification**: ∀ row ∈ ExcelRows, imported(row) ⟹ (row.partNumber ≠ ∅ ∧ row.name ≠ ∅ ∧ row.price > 0 ∧ row.stock ≥ 0)

Every imported row must have non-empty partNumber and name, positive price, and non-negative stock.

### Property 4: Dashboard Data Accuracy
**Universal Quantification**: ∀ metric ∈ DashboardMetrics, metric.value = computeFromDatabase(metric.query)

All dashboard metrics must be computed from real-time database queries, not hardcoded values.

### Property 5: MongoDB Migration Completeness
**Universal Quantification**: ∀ entity ∈ SQLiteDB, ∃ document ∈ MongoDB, equivalent(entity, document)

Every entity in SQLite must have an equivalent document in MongoDB after migration (excluding imageUrl field).

## Error Handling

### Error Scenario 1: Invalid Excel File Format

**Condition**: User uploads a file that is not a valid Excel file (.xlsx, .xls)
**Response**: Return 400 Bad Request with message "الملف المرفوع ليس ملف Excel صالح"
**Recovery**: User must select a valid Excel file

### Error Scenario 2: Missing Required Fields in Excel

**Condition**: Excel row is missing partNumber, name, price, or stock
**Response**: Skip row, add to errors array with specific field and Arabic message
**Recovery**: User downloads error report, fixes Excel file, re-uploads

### Error Scenario 3: MongoDB Connection Failure

**Condition**: Cannot connect to MongoDB Atlas (network issue, wrong credentials)
**Response**: Application fails to start, logs error message
**Recovery**: Check connection string, network connectivity, MongoDB Atlas status

### Error Scenario 4: Duplicate Part Number in Excel

**Condition**: Excel file contains multiple rows with same partNumber
**Response**: Update existing part with latest row data, count as "updated"
**Recovery**: Automatic - last occurrence wins

### Error Scenario 5: Empty Excel File

**Condition**: User uploads Excel file with no data rows (only header or completely empty)
**Response**: Return 400 Bad Request with message "ملف Excel فارغ - لا توجد بيانات للاستيراد"
**Recovery**: User must add data rows to Excel file

## Testing Strategy

### Unit Testing Approach

Test each service and utility function in isolation:

1. **Excel Service Tests**:
   - Test parseExcelFile with valid Excel files
   - Test parseExcelFile with invalid files (PDF, text, corrupted)
   - Test validateRows with various valid/invalid data combinations
   - Test generateTemplate produces valid Excel file

2. **Validation Tests**:
   - Test validateRow with all required fields present
   - Test validateRow with missing partNumber
   - Test validateRow with missing name
   - Test validateRow with invalid price (negative, zero, non-number)
   - Test validateRow with invalid stock (negative, decimal, non-number)

3. **MongoDB Schema Tests**:
   - Test Part schema validation (required fields, types)
   - Test Order schema validation (status enum, items array)
   - Test User schema validation (role enum, unique username)

4. **Analytics Service Tests**:
   - Test getTotalOrders with empty database
   - Test getTotalOrders with multiple orders
   - Test getTotalRevenue calculation accuracy
   - Test getStatusBreakdown with various order statuses

### Property-Based Testing Approach

**Property Test Library**: fast-check (for TypeScript/JavaScript)

1. **Excel Import Properties**:
   - Property: For any valid Excel row, import should succeed or return specific error
   - Generator: Generate random Excel rows with various field combinations
   - Assertion: imported + updated + failed = total rows

2. **Validation Properties**:
   - Property: For any row with all required fields, validation should pass
   - Generator: Generate rows with random valid values
   - Assertion: validateRow returns isValid = true

3. **Price Calculation Properties**:
   - Property: Order total should equal sum of (quantity × unitPrice) for all items
   - Generator: Generate random orders with multiple items
   - Assertion: order.totalAmount = Σ(item.quantity × item.unitPrice)

### Integration Testing Approach

Test complete workflows across multiple components:

1. **Excel Import End-to-End**:
   - Upload valid Excel file via API
   - Verify parts are created in MongoDB
   - Verify response contains correct summary

2. **MongoDB Migration**:
   - Populate SQLite with test data
   - Run migration script
   - Verify all data exists in MongoDB
   - Verify imageUrl is not migrated

3. **Dashboard Analytics**:
   - Create test orders and parts in MongoDB
   - Call analytics API endpoint
   - Verify returned metrics match database state

4. **Shop Portal UI**:
   - Navigate to catalog page
   - Verify products display in card layout
   - Verify search functionality works
   - Verify navigation between pages

## Performance Considerations

1. **Excel Import Performance**:
   - Use streaming for large Excel files (>1000 rows)
   - Batch database operations (bulk insert/update)
   - Implement progress reporting for long imports
   - Target: Import 1000 parts in <10 seconds

2. **MongoDB Query Optimization**:
   - Create indexes on frequently queried fields (partNumber, status, createdAt)
   - Use aggregation pipelines for complex analytics
   - Implement caching for dashboard metrics (Redis optional)
   - Target: Dashboard load time <2 seconds

3. **Frontend Performance**:
   - Implement pagination for product catalog (12 items per page)
   - Use lazy loading for images (if re-added in future)
   - Debounce search input (500ms delay)
   - Use React.memo for expensive components

## Security Considerations

1. **File Upload Security**:
   - Validate file type (only .xlsx, .xls allowed)
   - Limit file size (max 10MB)
   - Scan for malicious content (optional: antivirus integration)
   - Store uploaded files temporarily, delete after processing

2. **MongoDB Security**:
   - Use environment variables for connection string (never commit to git)
   - Enable MongoDB Atlas IP whitelist
   - Use strong password for database user
   - Enable audit logging for production

3. **Input Validation**:
   - Sanitize all Excel input data
   - Validate data types and ranges
   - Prevent SQL/NoSQL injection (use parameterized queries)
   - Escape special characters in user input

4. **Authentication**:
   - Require admin role for Excel import endpoint
   - Use JWT tokens for API authentication
   - Implement rate limiting on import endpoint (max 10 requests/hour per user)

## Dependencies

### Backend Dependencies (New)
- `mongoose`: ^8.0.0 - MongoDB ODM for Node.js
- `@nestjs/mongoose`: ^10.0.0 - NestJS integration for Mongoose
- `xlsx`: ^0.18.5 - Excel file parsing and generation
- `multer`: ^1.4.5-lts.1 - File upload handling (already included in NestJS)

### Backend Dependencies (Remove)
- `typeorm`: Remove after migration complete
- `@nestjs/typeorm`: Remove after migration complete
- `better-sqlite3`: Remove after migration complete

### Frontend Dependencies (No changes required)
- Existing React, Next.js, and styling libraries remain unchanged

### Environment Variables (New)
```env
MONGODB_URI=mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=spare-parts-system
MAX_EXCEL_FILE_SIZE=10485760
```

## Business Enhancement Suggestions

Based on research for spare parts businesses, here are practical non-technical features:

### 1. Bulk Order Discounts
- Offer automatic discounts for orders above certain quantities
- Example: 5% off for orders >10 parts, 10% off for orders >50 parts
- Encourages larger orders, increases revenue per transaction

### 2. Part Compatibility Checker
- Allow shops to search parts by vehicle make/model/year
- Show compatible parts for specific vehicles
- Reduces ordering errors, improves customer satisfaction

### 3. Order History & Reordering
- Shops can view their past orders
- One-click reorder of previous orders
- Saves time for repeat customers

### 4. Low Stock Notifications for Shops
- Notify shops when frequently ordered parts are low in stock
- Allows shops to plan ahead, reduces stockouts
- Can be implemented via email or in-app notifications

### 5. Supplier Management (Admin)
- Track which supplier provides each part
- Record supplier contact info and lead times
- Helps admin restock efficiently

### 6. Return/Exchange Workflow
- Allow shops to request returns for defective parts
- Admin can approve/reject return requests
- Track return reasons for quality improvement

### 7. Credit System
- Allow trusted shops to order on credit
- Set credit limits per shop
- Track outstanding balances and payment history

### 8. Delivery Scheduling
- Shops can select preferred delivery time slots
- Admin can optimize delivery routes
- Improves logistics efficiency

### 9. Part Alternatives/Substitutes
- Suggest alternative parts when primary part is out of stock
- Link compatible parts (OEM vs aftermarket)
- Reduces lost sales due to stockouts

### 10. Sales Reports & Insights
- Generate monthly sales reports by category, brand, shop
- Identify best-selling parts and slow-moving inventory
- Data-driven decision making for purchasing

**Implementation Priority** (Recommended):
1. Order History & Reordering (High value, low complexity)
2. Bulk Order Discounts (Immediate revenue impact)
3. Low Stock Notifications (Improves customer experience)
4. Part Compatibility Checker (Differentiator, high value)
5. Return/Exchange Workflow (Operational necessity)
