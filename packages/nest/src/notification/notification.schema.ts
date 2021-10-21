import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'notification', versionKey: false })
export class Notification extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number })
  store_id: number;

  @Prop({ type: Number, required: true })
  order_id: number;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Object })
  user_create: object;

  @Prop({ type: Object })
  user_update: object;

  @Prop({ type: Boolean, required: true })
  from_store: boolean;

  //0: new
  //1: processing
  //2: solved
  @Prop({ type: Number, required: true })
  status: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);