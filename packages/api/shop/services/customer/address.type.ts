import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Address {
  @Field()
  address: string;

  @Field()
  city: string;

  @Field()
  zip_code: string;
}
