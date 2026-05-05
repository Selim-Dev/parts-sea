import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// OrderItem is an embedded subdocument of Order.
// The @Schema() decorator is required so NestJS registers the @Prop metadata
// with Mongoose — without it, SchemaFactory produces an empty schema and
// items persist with only `_id`.
@Schema({
  _id: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      return ret;
    },
  },
})
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

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // When userId is populated, expose it as "user" for the frontend
      if (ret.userId && typeof ret.userId === 'object') {
        ret.user = ret.userId;
        delete ret.userId;
      }
      return ret;
    },
  },
})
export class Order extends Document {
  id?: string; // Virtual property added by toJSON transform

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
