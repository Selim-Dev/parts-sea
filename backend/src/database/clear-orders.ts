import { connect, connection } from 'mongoose';

async function clearOrders() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB_NAME || 'spare-parts-system';

    console.log('🔌 Connecting to MongoDB...');
    await connect(mongoUri, { dbName });
    console.log('✅ Connected to MongoDB');

    // Check if orders collection exists
    const collections = await connection.db.listCollections({ name: 'orders' }).toArray();
    
    if (collections.length === 0) {
      console.log('ℹ️  No orders collection found - nothing to clear');
    } else {
      const result = await connection.db.collection('orders').deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} orders`);
      console.log('✅ Orders cleared successfully!');
    }

    await connection.close();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
    process.exit(1);
  }
}

clearOrders();
