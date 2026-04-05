# SQLite to MongoDB Migration Guide

This document describes how to migrate data from the SQLite database to MongoDB.

## Overview

The migration script (`src/database/migrate-to-mongodb.ts`) transfers all data from the SQLite database to MongoDB Atlas, excluding the `imageUrl` field from parts as per business requirements.

## What Gets Migrated

1. **Users** - All user accounts with their credentials and roles
2. **Parts** - All spare parts (excluding `imageUrl` field)
3. **Orders** - All orders with their associated order items
4. **Order Items** - All order items linked to their respective orders

## Prerequisites

1. SQLite database file exists at `backend/data/spare-parts.db`
2. MongoDB connection string is configured in environment variables
3. Dependencies are installed (`npm install`)

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGODB_URI=mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=spare-parts-system
```

## Running the Migration

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run migrate
```

This will:
1. Build the project
2. Run the migration script
3. Display a detailed summary of the migration

### Option 2: Manual execution

```bash
cd backend
npm run build
node dist/database/run-migration.js
```

## Migration Process

The script performs the following steps:

1. **Connect to SQLite** - Opens the SQLite database in read-only mode
2. **Connect to MongoDB** - Establishes connection to MongoDB Atlas
3. **Migrate Users** - Transfers all users, mapping SQLite IDs to MongoDB ObjectIds
4. **Migrate Parts** - Transfers all parts, **excluding the imageUrl field**
5. **Migrate Orders** - Transfers all orders with their items, preserving relationships

## Migration Summary

After completion, you'll see a summary like this:

```
============================================================
📊 MIGRATION SUMMARY
============================================================
Users migrated:       2
Parts migrated:       10
Orders migrated:      2
Order items migrated: 5
Errors encountered:   0
============================================================

✅ Migration completed successfully! Total records: 19
```

## Important Notes

### Image URL Exclusion

The `imageUrl` field from the Part entity is **intentionally excluded** from the migration as per business requirements. This field will not exist in the MongoDB schema.

### Data Preservation

- All timestamps (createdAt, updatedAt) are preserved
- User passwords remain bcrypt hashed
- Order relationships are maintained through MongoDB ObjectId references
- Order items are embedded within orders as subdocuments

### Error Handling

If any errors occur during migration:
- The script will continue processing remaining records
- All errors are logged with details
- A summary of errors is displayed at the end
- The script exits with code 1 if errors occurred

### Re-running the Migration

⚠️ **Warning**: Running the migration multiple times will create duplicate records in MongoDB. If you need to re-run the migration:

1. Clear the MongoDB database first:
   ```javascript
   // In MongoDB shell or Compass
   use spare-parts-system
   db.users.deleteMany({})
   db.parts.deleteMany({})
   db.orders.deleteMany({})
   ```

2. Then run the migration again

## Troubleshooting

### SQLite database not found

**Error**: `ENOENT: no such file or directory, open './data/spare-parts.db'`

**Solution**: Ensure the SQLite database file exists at `backend/data/spare-parts.db`

### MongoDB connection failed

**Error**: `MongoServerError: Authentication failed`

**Solution**: 
- Check that `MONGODB_URI` is correctly set in `.env`
- Verify the MongoDB Atlas cluster is accessible
- Check network connectivity

### Build errors

**Error**: TypeScript compilation errors

**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check that old TypeORM entity files are renamed to `.old` extension
- Verify `sql.js` package is installed

## Technical Details

### Dependencies

- `sql.js` - Pure JavaScript SQLite implementation (no native dependencies)
- `mongoose` - MongoDB ODM for Node.js
- `@nestjs/mongoose` - NestJS integration for Mongoose

### Schema Mapping

#### User
- SQLite `id` → MongoDB `_id` (ObjectId)
- SQLite `password` → MongoDB `passwordHash`
- All other fields mapped directly

#### Part
- SQLite `id` → MongoDB `_id` (ObjectId)
- SQLite `imageUrl` → **EXCLUDED**
- All other fields mapped directly

#### Order
- SQLite `id` → MongoDB `_id` (ObjectId)
- SQLite `userId` → MongoDB `userId` (ObjectId reference)
- Order items embedded as subdocuments
- All other fields mapped directly

## Post-Migration Steps

After successful migration:

1. ✅ Verify data in MongoDB using MongoDB Compass or shell
2. ✅ Test the backend API endpoints
3. ✅ Test the frontend applications (dashboard and shop portal)
4. ✅ Backup the SQLite database file for safety
5. ✅ Update deployment configurations to use MongoDB

## Support

If you encounter issues during migration, check:
- MongoDB Atlas cluster status
- Network connectivity
- Environment variable configuration
- SQLite database file integrity
