import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'counter', versionKey: false })
export class Counter extends Document {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: Number, required: true })
  max_id: number;

  @Prop({ type: Number, required: true })
  total: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);