import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './order.schema.js';
import { Part } from '../parts/part.schema.js';
import { User } from '../users/user.schema.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const VALID_TRANSITIONS: Record<string, string> = {
  pending: 'approved',
  approved: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(Part.name)
    private readonly partModel: Model<Part>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const items = [];

    for (const item of dto.items) {
      const part = await this.partModel.findById(item.partId).exec();
      if (!part) {
        throw new NotFoundException(`القطعة رقم ${item.partId} غير موجودة`);
      }
      items.push({
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.name,
        unitPrice: part.price,
        quantity: item.quantity,
      });
    }

    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      orderNumber,
      status: 'pending',
      items,
    });

    return order.save();
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(status?: string): Promise<Order[]> {
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }
    return this.orderModel
      .find(filter)
      .populate('userId', 'username shopName role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: string, role?: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'username shopName role')
      .exec();
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (role === 'shop') {
      // When populated, userId is a User document with an id property
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const orderUserId =
        typeof order.userId === 'object' && 'id' in order.userId
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (order.userId as any).id
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            (order.userId as any).toString();
      if (orderUserId !== userId) {
        throw new ForbiddenException('ليس لديك صلاحية لعرض هذا الطلب');
      }
    }
    return order;
  }

  async updateStatus(id: string, newStatus: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    const expectedNext = VALID_TRANSITIONS[order.status];
    if (expectedNext !== newStatus) {
      throw new BadRequestException(
        `لا يمكن تغيير الحالة من ${order.status} إلى ${newStatus}`,
      );
    }

    order.status = newStatus;
    return order.save();
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (!['pending', 'approved'].includes(order.status)) {
      throw new BadRequestException('لا يمكن إلغاء الطلب في هذه المرحلة');
    }
    order.status = 'cancelled';
    return order.save();
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const startOfDay = new Date(yyyy, now.getMonth(), now.getDate());
    const endOfDay = new Date(yyyy, now.getMonth(), now.getDate() + 1);

    const count = await this.orderModel
      .countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      })
      .exec();

    const seq = String(count + 1).padStart(3, '0');
    return `ORD-${dateStr}-${seq}`;
  }
}
