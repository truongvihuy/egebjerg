import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user', versionKey: false })
export class User extends Document {
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

  @Prop({ type: Number, required: false })
  store_id: number;

  @Prop({ type: Object, required: false })
  session: object;

  @Prop({ type: Boolean, required: false })
  active: boolean;

  @Prop({ type: Number, required: false })
  user_update_id: number;

  @Prop({ type: Number, required: false })
  date_update: number;

  @Prop({ type: Number, required: false })
  date_create: number;

  @Prop({ type: Object, required: false })
  setting: object;
}

export const UserSchema = SchemaFactory.createForClass(User);