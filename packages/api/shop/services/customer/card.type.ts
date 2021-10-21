import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Card {
  @Field()
  _id: number;

  @Field()
  type: string;

  @Field()
  name: string;

  @Field()
  cardType: string;

  @Field()
  bin: string;

  @Field()
  lastFourDigit: string;
}
@ObjectType()
export class AddPaymentCardLinkResponse {
  @Field(type => String)
  url: string;
}