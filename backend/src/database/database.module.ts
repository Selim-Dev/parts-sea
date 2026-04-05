import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0',
      {
        dbName: process.env.MONGODB_DB_NAME || 'spare-parts-system',
        retryWrites: true,
        w: 'majority',
      },
    ),
  ],
})
export class DatabaseModule {}
