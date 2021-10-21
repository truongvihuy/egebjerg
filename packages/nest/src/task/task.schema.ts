import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
interface TaskConfig {
  start_time: null | number,
  end_time: null | number,
  time_cycle: null | number,
  day_cycle: null | number[]
}
@Schema({ collection: 'task', versionKey: false })
export class Task extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  content: string;

  @Prop({ type: Number, required: false })
  start_time: number;

  @Prop({ type: Number, required: false })
  end_time: number;

  @Prop({ type: Number, required: false })
  status: number;

  @Prop({ type: Object })
  config: TaskConfig;
}

export const TaskSchema = SchemaFactory.createForClass(Task);