import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'offer' })
export class Offer extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Number, required: true })
  user_group_id: number;

  @Prop({ type: String, required: false })
  email: string;

  @Prop({ type: String, required: false })
  avatar: string;

  @Prop({ type: [Object], required: false })
  card: object;

  @Prop({ type: Number, required: true })
  store_id: number;

  @Prop({ type: Array, required: false })
  favorite_list: number[];

  @Prop({ type: Array, required: false })
  most_bought_list: number[];

  @Prop({ type: Number, required: false })
  member_card_number: number;

  @Prop({ type: Boolean, required: false })
  replacement_goods: boolean;

  @Prop({ type: Boolean, required: false })
  pay_by_pbs: boolean;

  @Prop({ type: Object, required: false })
  address_info: object;

  @Prop({ type: [String], required: false })
  phone: string[];

  @Prop({ type: Object, required: false })
  session: object;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);