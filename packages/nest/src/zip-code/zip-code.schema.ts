import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'zip_code', versionKey: false })
export class ZipCode extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: Number, required: true })
  zip_code: number;

  @Prop({ type: Number, required: true })
  city_id: number;

  @Prop({ type: String, required: false })
  city_name: string;

  @Prop({ type: Number, required: false })
  municipality_id: number;

  @Prop({ type: Object, required: false })
  municipality_name: object;
}

export const ZipCodeSchema = SchemaFactory.createForClass(ZipCode);