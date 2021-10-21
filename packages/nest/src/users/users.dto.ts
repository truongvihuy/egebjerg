export class UserDTO {
  readonly _id: number;
  readonly username: string;
  readonly user_group_id: number;
  readonly password: string;
  readonly active: boolean;
  readonly setting: object;
}