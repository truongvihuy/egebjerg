import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Decimal128 } from 'mongoose';

// Decimal promblem
// https://stackoverflow.com/questions/61380443/mongodb-returning-with-numberdecimal-in-the-response-of-a-query
const mongoose = require('mongoose')
@Schema({ collection: 'municipality', versionKey: false, toJSON: {getters: true} })
export class Municipality extends Document {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  weight_limit: number;

  @Prop({ type: mongoose.Schema.Types.Decimal128, required: true, default: 0, get: getDecimal })
  overweight_price: Decimal128;
  
  @Prop()
  id: false;
}
function getDecimal(value) {
  if (typeof value !== 'undefined') {
    return parseFloat(value.toString());
  }
  return value;
};

const MunicipalitySchema = SchemaFactory.createForClass(Municipality);
export { MunicipalitySchema };