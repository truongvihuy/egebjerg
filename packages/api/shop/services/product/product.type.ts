import { ObjectType, Field, ID } from 'type-graphql';
import Category from '../category/category.type';
import Gallery from './gallery.type';
import PaginatedResponse from '../../helpers/paginated-response';

@ObjectType()
export class Offer {
  @Field()
  _id: number;

  @Field(() => [Number], { nullable: true })
  product_id: number[];

  @Field()
  sale_price: number;

  @Field()
  type: number;

  @Field(() => Number, { nullable: true })
  quantity: number;
}
@ObjectType()
export class StorePrice {
  @Field()
  store_id: number;

  @Field()
  price: number;
};

@ObjectType()
export default class Product {
  @Field()
  _id: number;

  @Field({ nullable: true })
  slug: string;

  @Field()
  name: string;

  @Field(() => [Number])
  category_id: number[];

  @Field()
  unit: string;

  @Field()
  weight: string;

  @Field({ nullable: true })
  image: string;

  // @Field(() => [Gallery])
  // gallery: Gallery[];

  @Field({ nullable: true })
  description: string;

  @Field()
  price: number;

  @Field()
  salePrice: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  is_coop_xtra: boolean;

  @Field({ nullable: true })
  is_ecology: boolean;

  @Field({ nullable: true })
  is_frozen: boolean;

  @Field(() => [Number])
  store_id_list: number[];

  @Field(() => Offer, { nullable: true })
  offer: Offer;

  @Field(() => [Category], { nullable: true })
  category: Category[];

  //none offer, inactive 0
  //none offer, active 1
  //offer, inactive 2
  //offer, active 3
  @Field(() => Number)
  status: number;

  @Field(() => Number)
  total_bought: number;

  @Field(() => Number, { nullable: true })
  base_value: number;

  @Field(() => String, { nullable: true })
  barcode?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  item_number: string[];

  @Field(() => Number, { nullable: true })
  order: number;

  @Field(() => [Number], { nullable: true })
  related_list: number[];

  @Field(() => [Number], { nullable: true })
  weight_list: number[];

  @Field(() => [StorePrice], { nullable: true })
  store_price_list?: StorePrice[];
}

// TODO: Need to change this in next update

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class ProductResponse extends PaginatedResponse(Product) {
  // simple helper for creating new instances easily
  constructor(productResponse: ProductResponse) {
    super();
    Object.assign(this, productResponse);
  }

  // you can add more fields here if you need
}
