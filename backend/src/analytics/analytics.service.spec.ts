import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Order } from '../orders/order.schema';
import { Part } from '../parts/part.schema';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockOrderModel: any;
  let mockPartModel: any;

  beforeEach(async () => {
    // Mock Order Model
    mockOrderModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      aggregate: jest.fn(),
    };

    // Mock Part Model
    mockPartModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      aggregate: jest.fn(),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn(),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Part.name),
          useValue: mockPartModel,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTotalOrders', () => {
    it('should return total count of orders', async () => {
      const expectedCount = 42;
      mockOrderModel.countDocuments().exec.mockResolvedValue(expectedCount);

      const result = await service.getTotalOrders();

      expect(result).toBe(expectedCount);
      expect(mockOrderModel.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getPendingOrdersCount', () => {
    it('should return count of pending orders', async () => {
      const expectedCount = 5;
      mockOrderModel.countDocuments().exec.mockResolvedValue(expectedCount);

      const result = await service.getPendingOrdersCount();

      expect(result).toBe(expectedCount);
      expect(mockOrderModel.countDocuments).toHaveBeenCalledWith({
        status: 'pending',
      });
    });
  });

  describe('getTotalRevenue', () => {
    it('should return total revenue from aggregation', async () => {
      const expectedRevenue = 15000;
      mockOrderModel.aggregate.mockResolvedValue([{ total: expectedRevenue }]);

      const result = await service.getTotalRevenue();

      expect(result).toBe(expectedRevenue);
      expect(mockOrderModel.aggregate).toHaveBeenCalled();
    });

    it('should return 0 when no orders exist', async () => {
      mockOrderModel.aggregate.mockResolvedValue([]);

      const result = await service.getTotalRevenue();

      expect(result).toBe(0);
    });
  });

  describe('getTotalParts', () => {
    it('should return total count of parts', async () => {
      const expectedCount = 150;
      mockPartModel.countDocuments().exec.mockResolvedValue(expectedCount);

      const result = await service.getTotalParts();

      expect(result).toBe(expectedCount);
      expect(mockPartModel.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getStatusBreakdown', () => {
    it('should return breakdown of orders by status', async () => {
      const aggregationResult = [
        { _id: 'pending', count: 5 },
        { _id: 'approved', count: 10 },
        { _id: 'delivered', count: 25 },
      ];
      mockOrderModel.aggregate.mockResolvedValue(aggregationResult);

      const result = await service.getStatusBreakdown();

      expect(result).toEqual({
        pending: 5,
        approved: 10,
        delivered: 25,
      });
      expect(mockOrderModel.aggregate).toHaveBeenCalled();
    });

    it('should return empty object when no orders exist', async () => {
      mockOrderModel.aggregate.mockResolvedValue([]);

      const result = await service.getStatusBreakdown();

      expect(result).toEqual({});
    });
  });

  describe('getTopSellingParts', () => {
    it('should return top selling parts with default limit', async () => {
      const expectedParts = [
        {
          partNumber: 'P001',
          name: 'Part 1',
          totalQuantity: 100,
          totalRevenue: 5000,
        },
        {
          partNumber: 'P002',
          name: 'Part 2',
          totalQuantity: 80,
          totalRevenue: 4000,
        },
      ];
      mockOrderModel.aggregate.mockResolvedValue(expectedParts);

      const result = await service.getTopSellingParts();

      expect(result).toEqual(expectedParts);
      expect(mockOrderModel.aggregate).toHaveBeenCalled();
    });

    it('should respect custom limit parameter', async () => {
      mockOrderModel.aggregate.mockResolvedValue([]);

      await service.getTopSellingParts(5);

      const aggregationPipeline = mockOrderModel.aggregate.mock.calls[0][0];
      const limitStage = aggregationPipeline.find((stage) => stage.$limit);
      expect(limitStage.$limit).toBe(5);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return breakdown of parts by category', async () => {
      const expectedBreakdown = [
        { category: 'Engine', count: 50, totalStock: 200 },
        { category: 'Brakes', count: 30, totalStock: 150 },
      ];
      mockPartModel.aggregate.mockResolvedValue(expectedBreakdown);

      const result = await service.getCategoryBreakdown();

      expect(result).toEqual(expectedBreakdown);
      expect(mockPartModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('getLowStockParts', () => {
    it('should return parts below default threshold', async () => {
      const expectedParts = [
        { partNumber: 'P001', name: 'Part 1', stock: 5 },
        { partNumber: 'P002', name: 'Part 2', stock: 8 },
      ];
      mockPartModel.find().sort().exec.mockResolvedValue(expectedParts);

      const result = await service.getLowStockParts();

      expect(result).toEqual(expectedParts);
      expect(mockPartModel.find).toHaveBeenCalledWith({ stock: { $lte: 10 } });
    });

    it('should respect custom threshold parameter', async () => {
      mockPartModel.find().sort().exec.mockResolvedValue([]);

      await service.getLowStockParts(20);

      expect(mockPartModel.find).toHaveBeenCalledWith({ stock: { $lte: 20 } });
    });
  });
});
