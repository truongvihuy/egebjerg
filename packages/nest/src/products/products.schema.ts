import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

type Associated = {
  _id: number;
  amount: number;
};
@Schema({ collection: 'product', versionKey: false, toJSON: { getters: true } })
export class Products extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: [String], required: true })
  item_number: string[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  unit: string;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Prop({ type: Number, required: false, default: 0 })
  price_no_tax: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: [Object] })
  gallery: Object[];

  @Prop({ type: [Number] })
  category_id: number[];

  @Prop({ type: Boolean, required: true })
  is_coop_xtra: boolean;

  @Prop({ type: Boolean, required: true })
  is_ecology: boolean;

  @Prop({ type: Boolean, required: true })
  is_frozen: boolean;

  @Prop({ type: Number, required: true })
  status: number;

  @Prop({ type: Number })
  total_bought: number;

  @Prop({ type: Number })
  order: number;

  @Prop({ type: [Number] })
  store_id_list: number[];

  @Prop({ type: Object })
  store_price_list: object;

  @Prop({ type: Boolean, required: true })
  is_baked: boolean;

  @Prop({ type: String })
  barcode: string;

  @Prop({ type: [Object] })
  associated_list: Associated[];

  @Prop({ type: [Number] })
  related_list: number[];

  @Prop({ type: [Number] })
  weight_list: number[];

  @Prop({ type: Number })
  base_value: number;

  @Prop({ type: Number })
  brand_id: number;

  @Prop({ type: Boolean })
  just_backend: boolean;

  @Prop({ type: [Number] })
  tag_id_list: number[];

  @Prop({ type: Object })
  purchase_history: object;
}

const ProductsSchema = SchemaFactory.createForClass(Products);
export { ProductsSchema };
