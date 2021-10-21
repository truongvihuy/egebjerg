import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
const mongoose = require('mongoose')

@Schema({ collection: 'mail', versionKey: false })
export class Mail extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  subject: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Object, required: true })
  instruction: object;
}

const MailSchema = SchemaFactory.createForClass(Mail);
export { MailSchema };