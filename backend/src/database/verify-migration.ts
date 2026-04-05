import { connect, connection } from 'mongoose';
import { UserSchema } from '../users/user.schema.js';
import { PartSchema } from '../parts/part.schema.js';
import { OrderSchema } from '../orders/order.schema.js';

/**
 * Verification script to check if migration was successful
 */
async function verifyMigration(): Promise<void> {
  try {
    console.log('🔍 Verifying MongoDB migration...\n');

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB_NAME || 'spare-parts-system';

    await connect(mongoUri, {
      dbName,
      retryWrites: true,
      w: 'majority',
    });

    // Register models
    const UserModel = connection.model('User', UserSchema);
    const PartModel = connection.model('Part', PartSchema);
    const OrderModel = connection.model('Order', OrderSchema);

    // Count documents
    const usersCount = await UserModel.countDocuments();
    const partsCount = await PartModel.countDocuments();
    const ordersCount = await OrderModel.countDocuments();

    console.log('📊 Document Counts:');
    console.log(`  Users:  ${usersCount}`);
    console.log(`  Parts:  ${partsCount}`);
    console.log(`  Orders: ${ordersCount}\n`);

    // Verify users
    console.log('👥 Sample Users:');
    const users = await UserModel.find().limit(3).exec();
    users.forEach((user) => {
      console.log(`  - ${user.username} (${user.role})`);
    });
    console.log();

    // Verify parts (check that imageUrl is not present)
    console.log('🔧 Sample Parts (checking imageUrl exclusion):');
    const parts = await PartModel.find().limit(3).exec();
    parts.forEach((part) => {
      const hasImageUrl = 'imageUrl' in part.toObject();
      console.log(
        `  - ${part.partNumber}: ${part.name} [imageUrl: ${hasImageUrl ? '❌ PRESENT' : '✅ EXCLUDED'}]`,
      );
    });
    console.log();

    // Verify orders with items
    console.log('📦 Sample Orders:');
    const orders = await OrderModel.find().limit(3).exec();
    orders.forEach((order) => {
      console.log(
        `  - ${order.orderNumber}: ${order.status} (${order.items.length} items)`,
      );
    });
    console.log();

    // Check for any parts with imageUrl field
    const partsWithImageUrl = await PartModel.find({ imageUrl: { $exists: true } });
    if (partsWithImageUrl.length > 0) {
      console.log(
        `⚠️  WARNING: Found ${partsWithImageUrl.length} parts with imageUrl field!`,
      );
    } else {
      console.log('✅ Verified: No parts have imageUrl field');
    }

    console.log('\n✅ Migration verification completed successfully!');
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  } finally {
    if (connection.readyState === 1) {
      await connection.close();
    }
  }
}

// Run verification
verifyMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
