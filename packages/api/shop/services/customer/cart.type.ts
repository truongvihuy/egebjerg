import { Field, Int, ArgsType, InputType, ObjectType } from 'type-graphql';
import Product from '../product/product.type';

@ObjectType()
export class AssociatedProduct extends Product {
  @Field(() => Number)
  amount: number;
}

@ObjectType()
export class ItemCart {
  @Field(() => Int, { nullable: true })
  _id: number;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  position: number;

  @Field(() => Number, { nullable: true })
  price?: number;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => Int, { nullable: true })
  weight_option?: number;
}

@ObjectType()
export class ItemCartAndInfoProduct {
  @Field(() => Product, { nullable: true })
  product: null | Product;

  @Field(() => ItemCart)
  cart: ItemCart;

  @Field(() => [AssociatedProduct], { nullable: true })
  associated_list: AssociatedProduct[];
}

@ObjectType()
export class CartResponse {
  @Field(() => [ItemCartAndInfoProduct], { nullable: true })
  product_list?: ItemCartAndInfoProduct[];

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => Number, { nullable: true })
  order_id?: number;
}