import { Double, Int32 } from 'bson';
export class SettingDTO {
  readonly _id: number;
  readonly key: string;
  readonly name: string;
  readonly value: number | string | object;
}