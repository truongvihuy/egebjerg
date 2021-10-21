import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
interface QuickPayInfo {
  secret: null | string,
  secret_key_account: null | string,
  api_key: null | string,
  agreement_id: null | string,
  merchant: null | string,
  card_type: null | string,
}
@Schema({ collection: 'store', versionKey: false })
export class Store extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: Number, required: true })
  zip_code_id: number;

  @Prop({ type: Boolean, required: true })
  send_packing_slip: boolean;

  @Prop({ type: [Number], required: true })
  municipality_list: number[];

  @Prop({ type: String, required: true })
  kardex_number: string | null;

  @Prop({ type: Boolean, required: true })
  has_quickpay: boolean | null;

  @Prop({ type: Boolean, required: true })
  has_its_own_prices: boolean | null;

  @Prop({ type: Boolean, required: true })
  has_quickpay_capture_activated: boolean | null;

  @Prop({ type: String, required: true })
  bakery_email: string;

  @Prop({ type: Object, required: true })
  quickpay_info: QuickPayInfo;

  @Prop({ type: Object })
  checkout_info: object;

  @Prop({ type: [String], required: false })
  payment: string[];
}

export const StoreSchema = SchemaFactory.createForClass(Store);