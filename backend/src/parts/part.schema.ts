import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Part extends Document {
  id?: string; // Virtual property added by toJSON transform

  @Prop({ required: true, unique: true })
  partNumber: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, type: Number, default: 0 })
  stock: number;

  @Prop({ default: '' })
  category: string;

  @Prop({ default: '' })
  brand: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PartSchema = SchemaFactory.createForClass(Part);
