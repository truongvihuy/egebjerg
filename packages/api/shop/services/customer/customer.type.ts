import { ObjectType, Field, Int, Float } from 'type-graphql';
import Address from './address.type';
import Card from './card.type';
import Store from './store.type';
import Zip_Code from './zip_code.type';
import Municipality from './municipality.type';
import ChildCustomer from './child_customer.type';
import { CartResponse } from './cart.type';

@ObjectType()
class ReplacementGoods {
  @Field(() => Boolean, { defaultValue: false })
  ordinary: boolean;

  @Field(() => Boolean, { defaultValue: false })
  promotion: boolean;

  @Field(() => Boolean, { defaultValue: false })
  milk_and_bread: boolean;
}

@ObjectType()
export default class Customer {
  @Field(type => Int)
  _id: number;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => String, { nullable: true })
  username?: string;

  @Field(type => String, { nullable: true })
  address?: string;

  @Field(type => String, { nullable: true })
  email?: string;

  @Field(type => [String], { nullable: true })
  phone?: string[];

  @Field(type => [Card], { nullable: true })
  card?: Card[];

  // @Field(type => String, { nullable: true })
  // zip_code_id?: string;

  @Field(type => Zip_Code, { nullable: true })
  zip_code?: Zip_Code;

  @Field(type => Municipality, { nullable: true })
  municipality?: Municipality

  @Field(type => String, { nullable: true })
  store_customer_number?: string;

  @Field(type => String, { nullable: true })
  membership_number?: string;

  @Field(type => String, { nullable: true })
  payment_method?: string;

  @Field(type => Boolean, { nullable: true })
  active: boolean;

  @Field(type => Int, { nullable: true })
  store_id: number;

  @Field(type => Store, { nullable: true })
  store: Store;

  @Field(type => Zip_Code, { nullable: true })
  store_zip_code?: Zip_Code;

  @Field(type => Int, { nullable: true })
  pbs_customer_number: number;

  @Field()
  type: number;

  @Field(type => [ChildCustomer], { nullable: true })
  customer_list: ChildCustomer[];

  @Field(type => [Int], { nullable: true })
  favorite_list: number[];

  @Field(type => [Int], { nullable: true })
  most_bought_list: number[];

  @Field(type => ReplacementGoods, { nullable: true })
  replacement_goods: ReplacementGoods;

  @Field(type => Float, { nullable: true })
  credit_limit: number;

  @Field(type => Float, { nullable: true })
  delivery_fee: number;

  @Field(type => [CartResponse], { nullable: true })
  cart?: CartResponse[];

  @Field(type => Int)
  sessionId: number;
}

@ObjectType()
export class AddCardGetLink {
  @Field(type => String)
  link: string;
}