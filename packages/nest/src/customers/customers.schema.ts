import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'customer', versionKey: false })
export class Customer extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  username: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: String, required: false })
  email: string;

  @Prop({ type: Number, required: false })
  store_id: number;

  @Prop({ type: String, required: false })
  store_customer_number: string;

  @Prop({ type: Array, required: false })
  favorite_list: number[];

  @Prop({ type: Array, required: false })
  most_bought_list: number[];

  @Prop({ type: String, required: false })
  membership_number: string;

  @Prop({ type: Object, required: false })
  billing: object;

  @Prop({ type: Object, required: false })
  replacement_goods: object;

  @Prop({ type: Boolean, required: false })
  pay_by_pbs: boolean;

  @Prop({ type: String, required: false })
  address: string;

  @Prop({ type: Number, required: false })
  zip_code_id: number;

  @Prop({ type: [String], required: false })
  phone: string[];

  @Prop({ type: Object, required: false })
  session: object;

  @Prop({ type: Object, required: false })
  customer_list: object;

  @Prop({ type: Number, required: true })
  type: number;

  @Prop({ type: Boolean, required: true })
  active: boolean;

  @Prop({ type: String, required: false })
  admin_comment: string;

  @Prop({ type: String, required: false })
  payment_method: string;

  @Prop({ type: Number, required: false })
  pbs_customer_number: number;

  @Prop({ type: Number, required: false })
  credit_limit: number;

  @Prop({ type: Number, default: 0 })
  fee_wallet_amount: number;

  @Prop({ type: Number, default: 0 })
  normal_wallet_amount: number;

  @Prop({ type: Number, required: false })
  delivery_fee: number;

  @Prop({ type: [[String]], required: false })
  comment_list: String[][];

  @Prop({ type: Object, required: false })
  manage_by: any;

  @Prop({ type: Object, required: false })
  cart: any;

  @Prop({ type: [Object], required: false })
  card: object[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);