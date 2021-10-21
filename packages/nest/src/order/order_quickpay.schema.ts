import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ collection: 'order_quickpay', versionKey: false })
export class OrderQuickpay extends Document {
  @Prop({ type: Number, required: true })
  _id: number;//must be geater than 1000

  @Prop({ type: Number, required: true })
  order_id: number;

  @Prop({ type: Number })
  payment_id: number;

  @Prop({ type: Boolean })
  result: boolean;

  @Prop({ type: String })
  result_message: string;
}

export const OrderQuickpaySchema = SchemaFactory.createForClass(OrderQuickpay);