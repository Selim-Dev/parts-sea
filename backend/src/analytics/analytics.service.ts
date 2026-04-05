import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/order.schema';
import { Part } from '../parts/part.schema';

export interface TopSellingPart {
  partNumber: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  totalStock: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Part.name) private partModel: Model<Part>,
  ) {}

  /**
   * Get total number of orders
   */
  async getTotalOrders(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  /**
   * Get count of pending orders
   */
  async getPendingOrdersCount(): Promise<number> {
    return this.orderModel.countDocuments({ status: 'pending' }).exec();
  }

  /**
   * Calculate total revenue from all orders
   */
  async getTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$items.quantity', '$items.unitPrice'],
            },
          },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Get total number of parts in catalog
   */
  async getTotalParts(): Promise<number> {
    return this.partModel.countDocuments().exec();
  }

  /**
   * Get breakdown of orders by status
   */
  async getStatusBreakdown(): Promise<Record<string, number>> {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const breakdown: Record<string, number> = {};
    result.forEach((item) => {
      breakdown[item._id] = item.count;
    });

    return breakdown;
  }

  /**
   * Get top selling parts by quantity and revenue
   */
  async getTopSellingParts(limit: number = 10): Promise<TopSellingPart[]> {
    const result = await this.orderModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.partNumber',
          name: { $first: '$items.partName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: {
              $multiply: ['$items.quantity', '$items.unitPrice'],
            },
          },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          partNumber: '$_id',
          name: 1,
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return result;
  }

  /**
   * Get breakdown of parts by category
   */
  async getCategoryBreakdown(): Promise<CategoryStats[]> {
    const result = await this.partModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          totalStock: 1,
        },
      },
    ]);

    return result;
  }

  /**
   * Get parts with stock below threshold
   */
  async getLowStockParts(threshold: number = 10): Promise<Part[]> {
    return this.partModel
      .find({ stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .exec();
  }
}
