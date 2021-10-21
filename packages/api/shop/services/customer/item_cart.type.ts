import { Field, Int, ArgsType, InputType } from 'type-graphql';
@InputType()
class ItemCartInput {
  @Field(() => Int)
  _id: number;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  price?: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  position: number;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => Int, { nullable: true })
  weight_option?: number;
}

@ArgsType()
export default class UpdateCartMultiArgs {
  @Field(() => [ItemCartInput])
  product_list: ItemCartInput[];
}
