import { migrateToMongoDB } from './migrate-to-mongodb.js';

/**
 * Main execution wrapper for migration script
 */
async function main() {
  try {
    await migrateToMongoDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  }
}

main();
