import { ObjectType, Field, ID } from 'type-graphql';
@ObjectType()
export default class Setting {
  @Field()
  _id: number;

  @Field()
  key: string;

  @Field()
  name: string;

  @Field(() => String ?? Number)
  value: string | number;
}