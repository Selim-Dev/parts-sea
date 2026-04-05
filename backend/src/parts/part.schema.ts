import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Part extends Document {
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
}

export const PartSchema = SchemaFactory.createForClass(Part);
