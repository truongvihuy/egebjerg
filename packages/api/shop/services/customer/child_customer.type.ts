import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export default class ChildCustomer {
  @Field(() => Int)
  _id: number;

  @Field(type => String, { nullable: true })
  username: string;

  @Field(type => String)
  name: string;
  
  @Field(type => Int, { nullable: true })
  unsubcribe?: boolean;
}
