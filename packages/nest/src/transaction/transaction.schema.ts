import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'transaction', versionKey: false })
export class Transaction extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  customer_id: number;

  // 1: fee
  // 2: normal
  @Prop({ type: Number, required: true })
  type: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, required: true })
  date: number;

  @Prop({ type: Number })
  pbs_id: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);