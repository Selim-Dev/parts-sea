import { connect, connection } from 'mongoose';

async function clearDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB_NAME || 'spare-parts-system';

    console.log('🔌 Connecting to MongoDB...');
    await connect(mongoUri, { dbName });
    console.log('✅ Connected to MongoDB');

    const collections = await connection.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🗑️  Dropping collection: ${collectionName}`);
      await connection.db.dropCollection(collectionName);
    }

    console.log('✅ All collections cleared successfully!');
    console.log('💡 You can now seed the database with fresh data');

    await connection.close();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
