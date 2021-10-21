import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
const mongoose = require('mongoose')

@Schema({ collection: 'setting', versionKey: false })
export class Setting extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Object ?? String ?? Number, required: true })
  value: object | string | number;
}

const SettingSchema = SchemaFactory.createForClass(Setting);
export { SettingSchema };