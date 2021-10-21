import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export default class ZipCode {
  @Field(type => Int)
  _id: number;

  @Field()
  zip_code: number;

  @Field(type => String, { nullable: true })
  city_name?: string;

  @Field(type => String, { nullable: true })
  municipality_name?: string
}