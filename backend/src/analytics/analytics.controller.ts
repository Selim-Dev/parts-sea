import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalParts,
      statusBreakdown,
    ] = await Promise.all([
      this.analyticsService.getTotalOrders(),
      this.analyticsService.getPendingOrdersCount(),
      this.analyticsService.getTotalRevenue(),
      this.analyticsService.getTotalParts(),
      this.analyticsService.getStatusBreakdown(),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalParts,
      statusBreakdown,
    };
  }

  @Get('top-selling')
  async getTopSelling(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopSellingParts(limitNum);
  }

  @Get('categories')
  async getCategories() {
    return this.analyticsService.getCategoryBreakdown();
  }

  @Get('low-stock')
  async getLowStock(@Query('threshold') threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold, 10) : 10;
    return this.analyticsService.getLowStockParts(thresholdNum);
  }
}
