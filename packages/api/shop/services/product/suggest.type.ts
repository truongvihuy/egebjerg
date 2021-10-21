import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export default class Suggest {
  @Field(() => Int, { nullable: true })
  _id: number;

  @Field({ nullable: true })
  text: string;

  @Field({ nullable: true })
  highlighted: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  slug: string;
}
