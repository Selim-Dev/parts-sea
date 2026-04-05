# Quick Reference Guide - Spare Parts System Backend

Quick reference for common tasks and commands.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Common Commands](#common-commands)
- [API Endpoints](#api-endpoints)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)
- [Monitoring](#monitoring)

---

## Environment Setup

### Required Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=App
MONGODB_DB_NAME=spare-parts-system
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=3000
MAX_EXCEL_FILE_SIZE=10485760
```

### Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run migration (if needed)
npm run migrate

# Start development server
npm run start:dev

# Start production server
npm run start:prod
```

---

## Common Commands

### Development

```bash
# Start in watch mode
npm run start:dev

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format
```

### Database

```bash
# Run migration from SQLite to MongoDB
npm run migrate

# Verify migration
npm run verify-migration

# Build project
npm run build
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Using PM2
pm2 start npm --name "spare-parts-api" -- run start:prod
pm2 logs spare-parts-api
pm2 restart spare-parts-api
pm2 stop spare-parts-api
```

---

## API Endpoints

### Authentication

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response: { "access_token": "jwt-token" }
```

### Excel Import

```http
# Download template
GET /parts/template
Authorization: Bearer <token>

# Import parts
POST /parts/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: file=<excel-file>
```

### Parts

```http
# Get all parts
GET /parts?page=1&limit=20&search=محرك&category=محركات

# Get part by ID
GET /parts/:id

# Create part (Admin only)
POST /parts
Authorization: Bearer <token>
Content-Type: application/json

{
  "partNumber": "PART-001",
  "name": "قطعة غيار",
  "price": 150,
  "stock": 50
}

# Update part (Admin only)
PUT /parts/:id
Authorization: Bearer <token>
```

### Analytics

```http
# Dashboard analytics
GET /analytics/dashboard
Authorization: Bearer <token>

# Top selling parts
GET /analytics/top-selling?limit=10
Authorization: Bearer <token>

# Low stock parts
GET /analytics/low-stock?threshold=10
Authorization: Bearer <token>

# Category breakdown
GET /analytics/categories
Authorization: Bearer <token>
```

### Orders

```http
# Get all orders
GET /orders?page=1&limit=20&status=pending

# Get order by ID
GET /orders/:id

# Create order
POST /orders
Authorization: Bearer <token>

# Update order status (Admin only)
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```

---

## Database Operations

### MongoDB Connection

```javascript
// Connect using mongosh
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/spare-parts-system"

// Or using MongoDB Compass
// Connection string: mongodb+srv://user:pass@cluster.mongodb.net/
```

### Common Queries

```javascript
// Switch to database
use spare-parts-system

// Count documents
db.parts.countDocuments()
db.orders.countDocuments()
db.users.countDocuments()

// Find documents
db.parts.find({ category: "محركات" }).limit(10)
db.orders.find({ status: "pending" })
db.users.find({ role: "admin" })

// Find by ID
db.parts.findOne({ _id: ObjectId("...") })

// Update document
db.parts.updateOne(
  { partNumber: "PART-001" },
  { $set: { price: 160, stock: 45 } }
)

// Delete document
db.parts.deleteOne({ partNumber: "PART-001" })

// Aggregation
db.orders.aggregate([
  { $group: {
    _id: "$status",
    count: { $sum: 1 }
  }}
])
```

### Index Management

```javascript
// List indexes
db.parts.getIndexes()
db.orders.getIndexes()

// Create index
db.parts.createIndex({ partNumber: 1 })
db.parts.createIndex({ name: "text", brand: "text" })
db.orders.createIndex({ status: 1, createdAt: -1 })

// Drop index
db.parts.dropIndex("index_name")

// Check index usage
db.parts.aggregate([{ $indexStats: {} }])
```

### Backup & Restore

```bash
# Backup
mongodump --uri="mongodb+srv://..." \
  --out=./backups/backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." \
  --drop \
  ./backups/backup-YYYYMMDD

# Backup specific collection
mongodump --uri="mongodb+srv://..." \
  --collection=parts \
  --out=./backups/parts-backup

# Restore specific collection
mongorestore --uri="mongodb+srv://..." \
  --collection=parts \
  ./backups/parts-backup/spare-parts-system/parts.bson
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError`

**Solutions**:
1. Check connection string format
2. Verify database user credentials
3. Check IP whitelist in MongoDB Atlas
4. Test network connectivity: `ping cluster.mongodb.net`

**Error**: `Authentication failed`

**Solutions**:
1. Verify username and password
2. Check database user permissions (readWrite role)
3. Ensure user is created for correct database

### Excel Import Issues

**Error**: "الملف المرفوع ليس ملف Excel صالح"

**Solutions**:
1. Ensure file extension is .xlsx or .xls
2. Verify file is not corrupted
3. Check file size (max 10MB)

**Error**: Validation errors

**Solutions**:
1. Download template to see correct format
2. Ensure required columns present
3. Check data types (price = number, stock = integer)
4. Verify no empty required fields

### Application Errors

**Error**: `Port 3000 already in use`

**Solutions**:
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run start:dev
```

**Error**: `Module not found`

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Performance Issues

**Slow queries**:
```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } })
  .sort({ millis: -1 })
  .limit(10)

// Add indexes for slow queries
db.parts.createIndex({ /* fields */ })
```

**High memory usage**:
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run start:prod

# Check for memory leaks
node --inspect dist/main.js
# Open chrome://inspect in Chrome
```

---

## Monitoring

### Check Application Health

```bash
# PM2 status
pm2 status
pm2 logs spare-parts-api
pm2 monit

# Docker status
docker ps
docker logs spare-parts-api
docker stats spare-parts-api

# Check if API is responding
curl http://localhost:3000/
curl http://localhost:3000/parts
```

### MongoDB Monitoring

**MongoDB Atlas Dashboard**:
- Connections: Should be < 80
- CPU: Should be < 70%
- Disk: Should be < 80%
- Query time: Should be < 100ms average

**Check from CLI**:
```javascript
// Current operations
db.currentOp()

// Server status
db.serverStatus()

// Database stats
db.stats()

// Collection stats
db.parts.stats()
```

### Log Locations

```bash
# Application logs
/var/log/spare-parts-api/app.log
/var/log/spare-parts-api/error.log

# PM2 logs
~/.pm2/logs/spare-parts-api-out.log
~/.pm2/logs/spare-parts-api-error.log

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# System logs
/var/log/syslog  # Ubuntu/Debian
/var/log/messages  # CentOS/RHEL
```

### Key Metrics to Monitor

**Application**:
- Response time: < 200ms average
- Error rate: < 1%
- Request rate: Monitor for spikes
- Active connections: < 100

**Database**:
- Query time: < 100ms average
- Connections: < 80
- Operations/sec: Monitor trends
- Disk usage: < 80%

**System**:
- CPU usage: < 70%
- Memory usage: < 80%
- Disk usage: < 80%
- Network traffic: Monitor for anomalies

---

## Quick Fixes

### Restart Services

```bash
# PM2
pm2 restart spare-parts-api

# Docker
docker restart spare-parts-api

# Systemd
sudo systemctl restart spare-parts-api

# Nginx
sudo systemctl restart nginx
```

### Clear Cache

```bash
# Application cache (if using Redis)
redis-cli FLUSHALL

# Node.js cache
rm -rf node_modules/.cache

# Build cache
rm -rf dist
npm run build
```

### Reset Database (Development Only)

```javascript
// Drop all collections
use spare-parts-system
db.dropDatabase()

// Re-run migration
npm run migrate
```

### Emergency Rollback

```bash
# Restore database from backup
mongorestore --uri="mongodb+srv://..." \
  --drop \
  ./backups/backup-YYYYMMDD

# Rollback application
pm2 stop spare-parts-api
# Restore previous version
pm2 start spare-parts-api

# Or with Docker
docker stop spare-parts-api
docker run -d --name spare-parts-api spare-parts-backend:previous-tag
```

---

## Useful Links

- **MongoDB Atlas**: https://cloud.mongodb.com
- **MongoDB Documentation**: https://docs.mongodb.com
- **NestJS Documentation**: https://docs.nestjs.com
- **PM2 Documentation**: https://pm2.keymetrics.io/docs

---

## Support Contacts

- **Technical Issues**: dev-team@example.com
- **Database Issues**: MongoDB Atlas Support
- **Security Issues**: security@example.com
- **Emergency**: +1-XXX-XXX-XXXX

---

## Cheat Sheet

### Most Used Commands

```bash
# Development
npm run start:dev

# Production
npm run build && npm run start:prod

# Migration
npm run migrate

# Logs
pm2 logs spare-parts-api

# Restart
pm2 restart spare-parts-api

# MongoDB
mongosh "mongodb+srv://..."

# Backup
mongodump --uri="..." --out=./backups/backup-$(date +%Y%m%d)
```

### Most Used Queries

```javascript
// Count all
db.parts.countDocuments()

// Find with filter
db.parts.find({ category: "محركات" })

// Update
db.parts.updateOne({ partNumber: "PART-001" }, { $set: { price: 160 } })

// Aggregate
db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } }}])

// Create index
db.parts.createIndex({ partNumber: 1 })
```

---

**Last Updated**: 2024
**Version**: 1.0
