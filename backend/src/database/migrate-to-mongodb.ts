import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';
import { connect, connection, Types } from 'mongoose';
import { UserSchema } from '../users/user.schema.js';
import { PartSchema } from '../parts/part.schema.js';
import { OrderSchema } from '../orders/order.schema.js';

interface MigrationSummary {
  usersCount: number;
  partsCount: number;
  ordersCount: number;
  orderItemsCount: number;
  errors: string[];
}

/**
 * Migration script to transfer data from SQLite to MongoDB
 * Excludes imageUrl field from parts as per requirements
 */
async function migrateToMongoDB(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    usersCount: 0,
    partsCount: 0,
    ordersCount: 0,
    orderItemsCount: 0,
    errors: [],
  };

  let sqliteDb: any = null;

  try {
    console.log('🚀 Starting migration from SQLite to MongoDB...\n');

    // Step 1: Connect to SQLite
    console.log('📂 Connecting to SQLite database...');
    const SQL = await initSqlJs();
    const fileBuffer = readFileSync('./data/spare-parts.db');
    sqliteDb = new SQL.Database(fileBuffer);
    console.log('✅ SQLite connection established\n');

    // Step 2: Connect to MongoDB
    console.log('🍃 Connecting to MongoDB...');
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB_NAME || 'spare-parts-system';

    await connect(mongoUri, {
      dbName,
      retryWrites: true,
      w: 'majority',
    });
    console.log('✅ MongoDB connection established\n');

    // Register models
    const UserModel = connection.model('User', UserSchema);
    const PartModel = connection.model('Part', PartSchema);
    const OrderModel = connection.model('Order', OrderSchema);

    // Step 3: Migrate Users
    console.log('👥 Migrating users...');
    const usersResult = sqliteDb.exec('SELECT * FROM user');
    const sqliteUsers = usersResult.length > 0 ? usersResult[0].values : [];

    const userIdMap = new Map<number, string>(); // Map SQLite ID to MongoDB _id

    for (const row of sqliteUsers) {
      try {
        const [id, username, password, role, shopName, isActive, createdAt] = row;

        const mongoUser = new UserModel({
          username,
          passwordHash: password, // Already bcrypt hashed
          role,
          shopName: shopName || undefined,
          isActive: isActive !== 0,
        });

        await mongoUser.save();
        userIdMap.set(id as number, mongoUser._id.toString());
        summary.usersCount++;
        console.log(`  ✓ Migrated user: ${username}`);
      } catch (error: any) {
        const errorMsg = `Failed to migrate user: ${error.message}`;
        console.error(`  ✗ ${errorMsg}`);
        summary.errors.push(errorMsg);
      }
    }
    console.log(`✅ Users migrated: ${summary.usersCount}/${sqliteUsers.length}\n`);

    // Step 4: Migrate Parts (excluding imageUrl)
    console.log('🔧 Migrating parts (excluding imageUrl)...');
    const partsResult = sqliteDb.exec('SELECT * FROM part');
    const sqliteParts = partsResult.length > 0 ? partsResult[0].values : [];

    for (const row of sqliteParts) {
      try {
        const [
          id,
          partNumber,
          name,
          price,
          description,
          stock,
          category,
          brand,
          imageUrl,
          createdAt,
          updatedAt,
        ] = row;

        const mongoPart = new PartModel({
          partNumber,
          name,
          price,
          description: description || '',
          stock,
          category: category || '',
          brand: brand || '',
          // imageUrl intentionally excluded
        });

        await mongoPart.save();
        summary.partsCount++;
        console.log(`  ✓ Migrated part: ${partNumber} - ${name}`);
      } catch (error: any) {
        const errorMsg = `Failed to migrate part: ${error.message}`;
        console.error(`  ✗ ${errorMsg}`);
        summary.errors.push(errorMsg);
      }
    }
    console.log(`✅ Parts migrated: ${summary.partsCount}/${sqliteParts.length}\n`);

    // Step 5: Migrate Orders with OrderItems
    console.log('📦 Migrating orders with order items...');
    const ordersResult = sqliteDb.exec('SELECT * FROM "order"');
    const sqliteOrders = ordersResult.length > 0 ? ordersResult[0].values : [];

    for (const row of sqliteOrders) {
      try {
        const [id, orderNumber, userId, status, createdAt, updatedAt] = row;

        // Map SQLite user ID to MongoDB user ID
        const mongoUserId = userIdMap.get(userId as number);
        if (!mongoUserId) {
          throw new Error(`User ID ${userId} not found in migration map`);
        }

        // Get order items for this order
        const orderItemsResult = sqliteDb.exec(
          `SELECT * FROM order_item WHERE orderId = ${id}`,
        );
        const sqliteOrderItems =
          orderItemsResult.length > 0 ? orderItemsResult[0].values : [];

        // Prepare order items
        const orderItems = sqliteOrderItems.map((itemRow) => {
          const [itemId, orderId, partId, partNumber, partName, unitPrice, quantity] =
            itemRow;
          return {
            partNumber,
            partName,
            quantity,
            unitPrice,
            partId: partId?.toString(),
          };
        });

        summary.orderItemsCount += orderItems.length;

        const mongoOrder = new OrderModel({
          orderNumber,
          userId: new Types.ObjectId(mongoUserId),
          status,
          items: orderItems,
          createdAt: new Date(createdAt as string),
          updatedAt: new Date(updatedAt as string),
        });

        await mongoOrder.save();
        summary.ordersCount++;
        console.log(
          `  ✓ Migrated order: ${orderNumber} (${orderItems.length} items)`,
        );
      } catch (error: any) {
        const errorMsg = `Failed to migrate order: ${error.message}`;
        console.error(`  ✗ ${errorMsg}`);
        summary.errors.push(errorMsg);
      }
    }
    console.log(`✅ Orders migrated: ${summary.ordersCount}/${sqliteOrders.length}`);
    console.log(`✅ Order items migrated: ${summary.orderItemsCount}\n`);

    return summary;
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    summary.errors.push(`Critical error: ${error.message}`);
    throw error;
  } finally {
    // Cleanup connections
    if (sqliteDb) {
      sqliteDb.close();
      console.log('🔌 SQLite connection closed');
    }

    if (connection.readyState === 1) {
      await connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

/**
 * Print migration summary
 */
function printSummary(summary: MigrationSummary): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Users migrated:       ${summary.usersCount}`);
  console.log(`Parts migrated:       ${summary.partsCount}`);
  console.log(`Orders migrated:      ${summary.ordersCount}`);
  console.log(`Order items migrated: ${summary.orderItemsCount}`);
  console.log(`Errors encountered:   ${summary.errors.length}`);
  console.log('='.repeat(60));

  if (summary.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    summary.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  const totalRecords =
    summary.usersCount +
    summary.partsCount +
    summary.ordersCount +
    summary.orderItemsCount;

  if (summary.errors.length === 0) {
    console.log(`\n✅ Migration completed successfully! Total records: ${totalRecords}`);
  } else {
    console.log(
      `\n⚠️  Migration completed with ${summary.errors.length} error(s). Total records: ${totalRecords}`,
    );
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const summary = await migrateToMongoDB();
    printSummary(summary);
    process.exit(summary.errors.length === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { migrateToMongoDB };
export type { MigrationSummary };
