import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'order_bakery', versionKey: false })
export class OrderBakery extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number, required: true })
  product_id: number;

  @Prop({ type: String })
  image: string;

  @Prop({ type: [String], required: true })
  item_number: string[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  note: string;

  @Prop({ type: String })
  unit: string;

  @Prop({ type: String })
  barcode: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({ type: Number, required: true })
  discount_quantity: number;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Number, required: true })
  order_id: number;

  @Prop({ type: Boolean, required: true })
  is_bakery: boolean;

  @Prop({ type: Number })
  associated_item_id?: number;

  @Prop({ type: Object })
  offer: object;

  @Prop({ type: Number, required: true })
  store_id: number;

  @Prop({ type: Number, required: true })
  date: number;

  @Prop({ type: Number, required: true })
  customer_id: number;
}

export const OrderBakerySchema = SchemaFactory.createForClass(OrderBakery);