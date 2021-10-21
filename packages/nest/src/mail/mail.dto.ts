import { Double, Int32 } from 'bson';
export class MailDTO {
  readonly _id: number;
  readonly key: string;
  readonly name: string;
  readonly subject: string;
  readonly content: string;
}