import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'brand', versionKey: false })
export class Brand extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);