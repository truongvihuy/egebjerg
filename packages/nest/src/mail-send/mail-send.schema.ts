import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'mail_queue', versionKey: false })
export class MailQueue extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number})
  customer_id: number;

  @Prop({ type: Number })
  home_helper_id: number;

  @Prop({ type: Number })
  mail_id: number;

  @Prop({ type: Number })
  order_id: number;

  @Prop({ type: Boolean })
  is_sent: boolean;
  
  @Prop({ type: Number })
  date: number;
}

export const MailQueueSchema = SchemaFactory.createForClass(MailQueue);