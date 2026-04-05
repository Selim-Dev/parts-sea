# Spare Parts Ordering System - Backend

A NestJS-based REST API for managing spare parts inventory, orders, and analytics with MongoDB integration.

## Description

This backend service provides a complete API for a spare parts ordering system, featuring:
- MongoDB database with Mongoose ODM
- JWT-based authentication
- Excel import/export for bulk parts management
- Real-time analytics and dashboard data
- Role-based access control (Admin/Shop)

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB Atlas account (or local MongoDB instance)

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=AppName
MONGODB_DB_NAME=spare-parts-system

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Application Configuration
PORT=3000

# Excel Import Configuration (optional)
MAX_EXCEL_FILE_SIZE=10485760
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) | Yes | - |
| `MONGODB_DB_NAME` | Database name | Yes | spare-parts-system |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `PORT` | Server port | No | 3000 |
| `MAX_EXCEL_FILE_SIZE` | Maximum Excel file size in bytes | No | 10485760 (10MB) |

**Security Note**: Never commit the `.env` file to version control. Use `.env.example` as a template.

## MongoDB Connection Setup

### Using MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster>` in the connection string
7. Add the connection string to your `.env` file as `MONGODB_URI`

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.mongodb.net/?appName=MyApp
```

### Using Local MongoDB

If you prefer to run MongoDB locally:

1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use local connection string in `.env`:
```
MONGODB_URI=mongodb://localhost:27017
```

## Project setup

```bash
$ npm install
```

## Database Migration

If you're migrating from SQLite to MongoDB, use the migration script:

```bash
# Build the project first
$ npm run build

# Run migration script
$ npm run migrate
```

The migration script will:
- Connect to both SQLite and MongoDB
- Transfer all users, parts, and orders
- Exclude imageUrl field from parts (as per requirements)
- Provide detailed migration summary

### Migration Script Usage

```bash
# Standard migration
$ npm run migrate

# Verify migration (check data integrity)
$ npm run verify-migration
```

**Important**: 
- Backup your SQLite database before migration
- Ensure MongoDB is empty before first migration
- The script will not migrate the `imageUrl` field from parts

## Compile and run the project

```bash
# development
$ npm run start

# watch mode (auto-reload on changes)
$ npm run start:dev

# production mode
$ npm run start:prod
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Admin-only endpoints require the user to have `role: 'admin'`.

### Excel Import API

#### Download Excel Template

```http
GET /parts/template
Authorization: Bearer <admin-token>
```

**Response**: Excel file download with Arabic column headers and example data

**Template Structure**:
| رقم القطعة | الاسم | السعر | المخزون | الوصف | التصنيف | الماركة |
|-----------|------|------|---------|-------|---------|--------|
| PART-001 | مثال قطعة | 150 | 50 | وصف القطعة | فئة | ماركة |

**Column Mapping**:
- رقم القطعة (partNumber) - Required, unique identifier
- الاسم (name) - Required, part name
- السعر (price) - Required, positive number
- المخزون (stock) - Required, non-negative integer
- الوصف (description) - Optional, part description
- التصنيف (category) - Optional, category name
- الماركة (brand) - Optional, brand name

#### Import Parts from Excel

```http
POST /parts/import
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

Body:
  file: <excel-file>
```

**Request**:
- File must be .xlsx or .xls format
- Maximum file size: 10MB
- File parameter name: `file`

**Response** (Success):
```json
{
  "success": true,
  "message": "تم استيراد 45 قطعة، تحديث 5 قطعة، فشل 0 قطعة",
  "data": {
    "totalRows": 50,
    "imported": 45,
    "updated": 5,
    "failed": 0,
    "errors": []
  }
}
```

**Response** (With Errors):
```json
{
  "success": false,
  "message": "تم استيراد 40 قطعة، تحديث 5 قطعة، فشل 5 قطعة",
  "data": {
    "totalRows": 50,
    "imported": 40,
    "updated": 5,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "field": "price",
        "message": "السعر يجب أن يكون رقم موجب",
        "value": -10
      },
      {
        "row": 7,
        "field": "partNumber",
        "message": "رقم القطعة مطلوب",
        "value": ""
      }
    ]
  }
}
```

**Validation Rules**:
- `partNumber`: Required, non-empty string
- `name`: Required, non-empty string
- `price`: Required, positive number
- `stock`: Required, non-negative integer
- Duplicate `partNumber` will update existing part

**Error Messages** (Arabic):
- "رقم القطعة مطلوب" - Part number is required
- "اسم القطعة مطلوب" - Part name is required
- "السعر مطلوب" - Price is required
- "السعر يجب أن يكون رقم موجب" - Price must be a positive number
- "المخزون مطلوب" - Stock is required
- "المخزون يجب أن يكون رقم صحيح غير سالب" - Stock must be a non-negative integer
- "الملف المرفوع ليس ملف Excel صالح" - Uploaded file is not a valid Excel file
- "ملف Excel فارغ - لا توجد بيانات للاستيراد" - Excel file is empty

### Analytics API

#### Get Dashboard Analytics

```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "totalOrders": 150,
  "pendingOrders": 12,
  "totalRevenue": 45000.50,
  "totalParts": 320,
  "statusBreakdown": {
    "pending": 12,
    "approved": 8,
    "preparing": 15,
    "ready": 20,
    "delivered": 95
  }
}
```

**Description**: Returns real-time dashboard KPIs computed from MongoDB aggregations.

#### Get Top Selling Parts

```http
GET /analytics/top-selling?limit=10
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (optional): Number of results, default 10

**Response**:
```json
[
  {
    "partNumber": "PART-001",
    "name": "قطعة غيار رقم 1",
    "totalQuantity": 150,
    "totalRevenue": 22500
  }
]
```

#### Get Category Breakdown

```http
GET /analytics/categories
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "category": "محركات",
    "count": 45,
    "totalStock": 320
  }
]
```

#### Get Low Stock Parts

```http
GET /analytics/low-stock?threshold=10
Authorization: Bearer <token>
```

**Query Parameters**:
- `threshold` (optional): Stock threshold, default 10

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "partNumber": "PART-001",
    "name": "قطعة غيار",
    "stock": 5,
    "price": 150
  }
]
```

### Parts API

#### Get All Parts

```http
GET /parts?page=1&limit=20&search=محرك&category=محركات&brand=تويوتا
```

**Query Parameters**:
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `search` (optional): Search by part number, name, or brand
- `category` (optional): Filter by category
- `brand` (optional): Filter by brand

**Response**:
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "partNumber": "PART-001",
      "name": "قطعة غيار",
      "price": 150,
      "stock": 50,
      "category": "محركات",
      "brand": "تويوتا",
      "description": "وصف القطعة"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### Get Part by ID

```http
GET /parts/:id
```

#### Create Part

```http
POST /parts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "partNumber": "PART-001",
  "name": "قطعة غيار",
  "price": 150,
  "stock": 50,
  "category": "محركات",
  "brand": "تويوتا",
  "description": "وصف القطعة"
}
```

#### Update Part

```http
PUT /parts/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 160,
  "stock": 45
}
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Dependencies

### Core Dependencies

- **@nestjs/core** (^11.0.1) - NestJS framework core
- **@nestjs/common** (^11.0.17) - Common NestJS utilities
- **@nestjs/platform-express** (^11.1.11) - Express platform adapter

### Database

- **mongoose** (^9.4.1) - MongoDB ODM for Node.js
- **@nestjs/mongoose** (^11.0.4) - NestJS integration for Mongoose
- **sql.js** (^1.12.0) - SQLite for migration purposes

### Authentication

- **@nestjs/jwt** (^11.0.2) - JWT token handling
- **@nestjs/passport** (^11.0.5) - Passport integration
- **passport** (^0.7.0) - Authentication middleware
- **passport-jwt** (^4.0.1) - JWT strategy for Passport
- **bcrypt** (^6.0.0) - Password hashing

### Excel Processing

- **xlsx** (^0.18.5) - Excel file parsing and generation

### Validation

- **class-validator** (^0.15.1) - Decorator-based validation
- **class-transformer** (^0.5.1) - Object transformation

## Deployment

### Production Checklist

Before deploying to production:

1. **Environment Variables**
   - [ ] Set `MONGODB_URI` with production MongoDB connection string
   - [ ] Set strong `JWT_SECRET` (minimum 32 characters)
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure `PORT` if needed

2. **Database**
   - [ ] Create production MongoDB database
   - [ ] Configure MongoDB Atlas IP whitelist for production servers
   - [ ] Run migration script if migrating from SQLite
   - [ ] Create database backup before deployment
   - [ ] Verify all data migrated correctly

3. **Security**
   - [ ] Enable MongoDB authentication
   - [ ] Use strong database passwords
   - [ ] Enable HTTPS/TLS for API
   - [ ] Configure CORS for frontend domains
   - [ ] Set up rate limiting
   - [ ] Enable MongoDB audit logging

4. **Performance**
   - [ ] Create MongoDB indexes (partNumber, status, createdAt)
   - [ ] Enable MongoDB connection pooling
   - [ ] Configure appropriate file upload limits
   - [ ] Set up caching if needed (Redis)

5. **Monitoring**
   - [ ] Set up error logging (e.g., Sentry)
   - [ ] Monitor MongoDB performance metrics
   - [ ] Set up uptime monitoring
   - [ ] Configure alerts for critical errors

### Deployment Steps

```bash
# 1. Build the application
$ npm run build

# 2. Run migration (if needed)
$ npm run migrate

# 3. Verify migration
$ npm run verify-migration

# 4. Start production server
$ npm run start:prod
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

Build and run:
```bash
$ docker build -t spare-parts-backend .
$ docker run -p 3000:3000 --env-file .env spare-parts-backend
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB Atlas
- Check connection string format
- Verify database user credentials
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**Problem**: "Authentication failed"
- Verify username and password in connection string
- Check database user permissions (readWrite role required)

### Excel Import Issues

**Problem**: "الملف المرفوع ليس ملف Excel صالح"
- Ensure file has .xlsx or .xls extension
- Verify file is not corrupted
- Check file size (max 10MB)

**Problem**: Import fails with validation errors
- Download template to see correct format
- Ensure required columns are present (رقم القطعة، الاسم، السعر، المخزون)
- Check data types (price must be number, stock must be integer)

### Migration Issues

**Problem**: Migration script fails
- Ensure SQLite database file exists at `./data/spare-parts.db`
- Check MongoDB connection string
- Verify MongoDB database is empty (for first migration)
- Check file permissions

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation
3. Check MongoDB Atlas status
4. Review application logs

## License

This project is proprietary software.
