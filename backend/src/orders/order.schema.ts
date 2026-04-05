import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// OrderItem will be defined as a subdocument schema
export class OrderItem {
  @Prop({ required: true })
  partNumber: string;

  @Prop({ required: true })
  partName: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  unitPrice: number;

  @Prop({ required: false })
  partId?: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'preparing', 'ready', 'delivered'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
