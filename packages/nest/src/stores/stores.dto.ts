export class StoreDTO {
  readonly _id: number;
  readonly name: string;
  readonly adress: string;
  readonly city: string;
  readonly zip_code_id: number;
  readonly send_packing_slip: boolean;
  readonly municipaity_list: [number];
  readonly kardex_number: string | null;
  readonly has_its_own_prices: boolean;
  readonly has_quickpay: boolean;
}