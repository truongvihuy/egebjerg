import { Number, Decimal128 } from 'mongoose';
export class MunicipalityDTO {
  readonly _id: Number;
  readonly name: String;
  readonly weight_limit: Number;
  readonly overweight_price: Decimal128;
}




