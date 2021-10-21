import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
const mongoose = require('mongoose')

@Schema({ collection: 'pbs', versionKey: false })
export class PBS extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number, required: true })
  from: number;

  @Prop({ type: Number, required: true })
  to: number;

  @Prop({ type: Number, required: true })
  date: number;

  @Prop({ type: String, required: true })
  file: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  status: number;

  @Prop({ type: Object, required: true })
  order_id_list: object;
}

const PBSSchema = SchemaFactory.createForClass(PBS);
export { PBSSchema };