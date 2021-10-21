export class CategoryDTO {
  readonly _id: number;
  readonly name: string;
  readonly level: number;
  readonly parent_id: number;
  readonly slug: string;
  readonly img: string;
  readonly children: number[];
  readonly children_direct: number[];
  readonly children_order: number;
  readonly active: boolean;
}