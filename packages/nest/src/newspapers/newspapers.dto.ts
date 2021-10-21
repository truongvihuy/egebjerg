export class NewspapersDTO {
  readonly _id: number;
  readonly name: string;
  readonly offer_list: object;
  readonly total_page: number;
  readonly active: boolean;
  readonly from: number;
  readonly to: number
  readonly date_create: number;
}