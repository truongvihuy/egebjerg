import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'offer', versionKey: false })
export class Offers extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: [Number], required: true })
  product_id_list: number[];

  @Prop({ type: Number, required: true })
  sale_price: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  // @Prop({ type: Number, required: true })
  // from: number;

  // @Prop({ type: Number, required: true })
  // to: number;

  @Prop({ type: Number, required: true })
  type: number;

  @Prop({ type: Number, required: true })
  newspaper_id: number;

  // @Prop({ type: Number, required: true })
  // page: number;

  @Prop({ type: Boolean, required: false })
  active: boolean;
}

export const OffersSchema = SchemaFactory.createForClass(Offers);