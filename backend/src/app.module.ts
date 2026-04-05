import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PartsModule } from './parts/parts.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    PartsModule,
    OrdersModule,
    AnalyticsModule,
    HealthModule,
  ],
})
export class AppModule {}
