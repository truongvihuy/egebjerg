import { ObjectType, Field, Int } from 'type-graphql';
import PaginatedResponse from '../../helpers/paginated-response';
import OrderProduct from './orderProduct.type';
import Address from '../customer/address.type';
// import { OrderStatusEnum } from './orderStatusEnum';

@ObjectType()
export default class Order {
  @Field()
  _id: number;

  @Field()
  customer_id: number;

  @Field()
  customer_name: number;

  @Field(type => [OrderProduct])
  product_list: OrderProduct[];

  @Field()
  status: number;

  @Field(type => Address)
  address_info: Address;

  @Field()
  created_date: number;

  @Field()
  position: number;

  @Field()
  payment_method: string;

  @Field()
  subtotal: number;

  @Field()
  discount: number;

  // @Field()
  // vat_fee: number;

  @Field()
  delivery_fee: number;

  @Field()
  total_weight: number;

  @Field()
  overweight_fee: number;

  @Field(type => Number, { nullable: true })
  overweight: number;

  @Field(type => Number, { nullable: true })
  is_overweight: boolean;

  @Field()
  amount: number;

  @Field(type => String, { nullable: true })
  payment_url: string;

  @Field()
  order_quickpay_id: number;
}

// TODO: Need to change this in next update

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class OrderResponse extends PaginatedResponse(Order) {
  // simple helper for creating new instances easily
  constructor(orderResponse: OrderResponse) {
    super();
    Object.assign(this, orderResponse);
  }

  // you can add more fields here if you need
}