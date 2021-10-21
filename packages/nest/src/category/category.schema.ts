import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'category', versionKey: false })
export class Category extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  img: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: Boolean, required: true })
  active: boolean;

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: Number, required: false })
  parent_id: number;

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: [Number], required: false })
  children: number[];

  @Prop({ type: [Number], required: false })
  children_direct: number[];

  @Prop({ type: Number, required: false })
  date_update: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);