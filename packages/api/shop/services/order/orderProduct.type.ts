import { ObjectType, Field } from 'type-graphql';
import Category from '../category/category.type';

@ObjectType()
export default class OrderProduct {
  @Field({ nullable: true })
  _id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  slug: string;

  @Field({ nullable: true })
  barcode: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  weight: number;

  @Field({ nullable: true })
  unit: string;

  @Field()
  quantity: number;

  @Field({ nullable: true })
  quantity_discount: number;

  @Field({ nullable: true })
  note: string;

  @Field({ nullable: true })
  discount: number;

  @Field()
  total: number;
}
