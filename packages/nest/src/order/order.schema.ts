import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
interface Store {
  _id: null | number,
  name: null | string,
}
@Schema({ collection: 'order', versionKey: false })
export class Order extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number, required: true })
  position: number;

  @Prop({ type: String, required: false })
  note: string;

  @Prop({ type: Number, required: true })
  created_date: number;

  @Prop({ type: Number, required: true })
  status: number;

  @Prop({ type: [Object], required: true })
  product_list: object[];

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({ type: Number, required: true })
  delivery_fee: number;

  @Prop({ type: Number, required: true })
  total_weight: number;

  @Prop({ type: Number, required: true })
  overweight_fee: number;

  @Prop({ type: Number, required: false })
  overweight: number;

  @Prop({ type: Boolean, required: true })
  is_overweight: boolean;

  @Prop({ type: Object, required: false })
  overweight_rate: object;

  // @Prop({ type: Number, required: true })
  // vat_fee: number;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  customer_id: number;

  @Prop({ type: String, required: true })
  customer_name: string;

  @Prop({ type: Object, required: true })
  address_info: object;

  @Prop({ type: String, required: false })
  admin_comment: string;

  @Prop({ type: Object, required: false })
  replacement_goods: object;

  @Prop({ type: String, required: false })
  payment_method: string;

  @Prop({ type: Object, required: false })
  store: Store;

  @Prop({ type: Object, required: false })
  municipality: object;

  @Prop({ type: String, required: false })
  store_customer_number: string;

  @Prop({ type: String, required: false })
  membership_number: string;

  @Prop({ type: String, required: false })
  shipping_code: string;

  @Prop({ type: [String], required: false })
  phone: string[];

  @Prop({ type: String, required: false })
  email: string;

  @Prop({ type: String, required: false })
  session: string;

  @Prop({ type: Object, required: false })
  order_by: object;

  @Prop({ type: Number, required: false })
  claim_date: number;

  @Prop({ type: Number, required: false })
  amount_claim: number;

  @Prop({ type: Object, required: false })
  claim_by: object;

  @Prop({ type: Number, required: false })
  amount_refund: number;

  @Prop({ type: Number, required: false })
  refund_date: number;

  @Prop({ type: Object, required: false })
  refund_by: object;

  @Prop({ type: Number, required: false })
  order_quickpay_id: number;

  @Prop({ type: Boolean, required: false })
  is_saved_card: boolean;

  @Prop({ type: Boolean })
  close_status: boolean;

  @Prop({ type: Number, required: false })
  parent_order_id: number;

  @Prop({ type: [Number], required: false })
  child_order_id_list: number[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);