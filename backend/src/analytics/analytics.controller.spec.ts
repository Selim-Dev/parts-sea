import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getTotalOrders: jest.fn(),
    getPendingOrdersCount: jest.fn(),
    getTotalRevenue: jest.fn(),
    getTotalParts: jest.fn(),
    getStatusBreakdown: jest.fn(),
    getTopSellingParts: jest.fn(),
    getCategoryBreakdown: jest.fn(),
    getLowStockParts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard analytics data', async () => {
      const mockData = {
        totalOrders: 42,
        pendingOrders: 5,
        totalRevenue: 15000,
        totalParts: 150,
        statusBreakdown: { pending: 5, approved: 10, delivered: 27 },
      };

      mockAnalyticsService.getTotalOrders.mockResolvedValue(
        mockData.totalOrders,
      );
      mockAnalyticsService.getPendingOrdersCount.mockResolvedValue(
        mockData.pendingOrders,
      );
      mockAnalyticsService.getTotalRevenue.mockResolvedValue(
        mockData.totalRevenue,
      );
      mockAnalyticsService.getTotalParts.mockResolvedValue(
        mockData.totalParts,
      );
      mockAnalyticsService.getStatusBreakdown.mockResolvedValue(
        mockData.statusBreakdown,
      );

      const result = await controller.getDashboard();

      expect(result).toEqual(mockData);
      expect(mockAnalyticsService.getTotalOrders).toHaveBeenCalled();
      expect(mockAnalyticsService.getPendingOrdersCount).toHaveBeenCalled();
      expect(mockAnalyticsService.getTotalRevenue).toHaveBeenCalled();
      expect(mockAnalyticsService.getTotalParts).toHaveBeenCalled();
      expect(mockAnalyticsService.getStatusBreakdown).toHaveBeenCalled();
    });
  });

  describe('getTopSelling', () => {
    it('should return top selling parts with default limit', async () => {
      const mockParts = [
        {
          partNumber: 'P001',
          name: 'Part 1',
          totalQuantity: 100,
          totalRevenue: 5000,
        },
      ];
      mockAnalyticsService.getTopSellingParts.mockResolvedValue(mockParts);

      const result = await controller.getTopSelling();

      expect(result).toEqual(mockParts);
      expect(mockAnalyticsService.getTopSellingParts).toHaveBeenCalledWith(10);
    });

    it('should return top selling parts with custom limit', async () => {
      const mockParts = [
        {
          partNumber: 'P001',
          name: 'Part 1',
          totalQuantity: 100,
          totalRevenue: 5000,
        },
      ];
      mockAnalyticsService.getTopSellingParts.mockResolvedValue(mockParts);

      const result = await controller.getTopSelling('5');

      expect(result).toEqual(mockParts);
      expect(mockAnalyticsService.getTopSellingParts).toHaveBeenCalledWith(5);
    });
  });

  describe('getCategories', () => {
    it('should return category breakdown', async () => {
      const mockCategories = [
        { category: 'Engine', count: 50, totalStock: 200 },
        { category: 'Brakes', count: 30, totalStock: 150 },
      ];
      mockAnalyticsService.getCategoryBreakdown.mockResolvedValue(
        mockCategories,
      );

      const result = await controller.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockAnalyticsService.getCategoryBreakdown).toHaveBeenCalled();
    });
  });

  describe('getLowStock', () => {
    it('should return low stock parts with default threshold', async () => {
      const mockParts = [
        { partNumber: 'P001', name: 'Part 1', stock: 5 },
        { partNumber: 'P002', name: 'Part 2', stock: 8 },
      ];
      mockAnalyticsService.getLowStockParts.mockResolvedValue(mockParts);

      const result = await controller.getLowStock();

      expect(result).toEqual(mockParts);
      expect(mockAnalyticsService.getLowStockParts).toHaveBeenCalledWith(10);
    });

    it('should return low stock parts with custom threshold', async () => {
      const mockParts = [{ partNumber: 'P001', name: 'Part 1', stock: 15 }];
      mockAnalyticsService.getLowStockParts.mockResolvedValue(mockParts);

      const result = await controller.getLowStock('20');

      expect(result).toEqual(mockParts);
      expect(mockAnalyticsService.getLowStockParts).toHaveBeenCalledWith(20);
    });
  });
});
