import { ObjectType, Field, Float } from 'type-graphql';

@ObjectType()
export default class Municipality {
  @Field(() => Number, { nullable: true })
  _id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Number, { nullable: true })
  weight_limit: number;

  @Field(() => Float, { nullable: true })
  overweight_price: number
}