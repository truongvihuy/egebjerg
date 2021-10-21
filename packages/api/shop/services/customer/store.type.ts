import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
class CheckoutInfo {
  @Field()
  phone: number;

  @Field()
  email: string;

  @Field()
  cvr_number: number;
}

@ObjectType()
export default class Store {
  @Field(type => Int)
  _id: number;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field(type => [String], { nullable: true })
  payment?: string[]

  @Field(type => CheckoutInfo, { nullable: true })
  checkout_info: CheckoutInfo
}