export class ProductsDTO {
  readonly _id: number;
  readonly name: string;
  readonly slug: string;
  readonly unit: string;
  readonly weight: number;
  readonly price: number;
  readonly description: string;
  readonly image: string;
  readonly gallery: Object[];
  readonly category_id: number[];
  readonly is_coop_xtra: boolean;
  readonly is_ecology: boolean;
  readonly is_frozen: boolean;
  readonly status: number;
  readonly total_bought: number;
  readonly order: number;
  readonly store_id_list: number[];
}