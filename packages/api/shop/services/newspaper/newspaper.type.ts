import { isNullableType } from 'graphql';
import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class Image {
  @Field(() => String)
  uid: string;

  @Field(() => String)
  slug: string;
};

@ObjectType()
export class OfferList {
  @Field(type => [[Int]])
  offer_id_list: number[][];

  @Field(() => [[Int]])
  product_id_list: number[][];

  @Field(type => [Image], { nullable: 'itemsAndList' })
  img_list: Image[];
}

@ObjectType()
export default class Newspaper {
  @Field()
  _id: number;

  @Field()
  name: string;

  @Field(() => OfferList)
  offer_list: OfferList;

  @Field(() => Int)
  from: number;

  @Field(() => Int)
  to: number;

  @Field({ nullable: true })
  active: number;

  @Field(() => Int, { defaultValue: 48 })
  total_page: number;
}
