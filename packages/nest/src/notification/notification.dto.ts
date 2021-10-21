export class NotificationDTO {
  readonly store_id: Number;
  readonly order_id: Number;
  readonly message: String;
  readonly user_create: Object;
  readonly user_update: Object;
  readonly from_store: Boolean;
  readonly status: Number;
}