import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

type OfferList = {
  offer_id_list: number[][],
  product_id_list: number[][],
  img_list: object[],
}

@Schema({ collection: 'newspaper', versionKey: false })
export class Newspapers extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Object, required: true })
  offer_list: OfferList;

  @Prop({ type: Number, required: true })
  total_page: number;

  @Prop({ type: Boolean, required: true })
  active: boolean;

  @Prop({ type: Number, required: true })
  date_create: number;

  @Prop({ type: Number, required: true })
  from: number;

  @Prop({ type: Number, required: true })
  to: number;
}

export const NewspapersSchema = SchemaFactory.createForClass(Newspapers);