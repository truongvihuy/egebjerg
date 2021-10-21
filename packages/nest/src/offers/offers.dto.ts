export class OffersDTO {
  readonly _id: number;
  readonly product_id_list: number[];
  readonly sale_price: number;
  readonly quantity: number;
  // readonly from: number;
  // readonly to: number;
  readonly type: number;
  readonly newspaper_id: number;
  // readonly page: number;
  readonly active: boolean;
}