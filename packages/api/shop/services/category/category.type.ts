import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export default class Category {
  @Field(type => Int)
  _id: number;

  @Field()
  name: string;

  @Field(type => [Number], { nullable: true })
  children_direct?: Array<number>;

  @Field(type => [Number], { nullable: true })
  children?: Array<number>;

  @Field(type => Int, { nullable: true })
  parent_id?: number;


  @Field(type => Int)
  level: number;

  @Field(type => String)
  type: string;

  @Field(type => String, { nullable: true })
  img?: string;

  @Field(type => String)
  slug: string;

  @Field(type => Boolean)
  active: Boolean;

  @Field(type => Int, { nullable: true })
  itemCount: number;

  @Field(type => Int)
  order: number;
}