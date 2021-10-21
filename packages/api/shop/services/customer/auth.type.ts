import { ObjectType, Field, Int } from 'type-graphql';
import Customer from './customer.type';
@ObjectType()
export class LoginType {
    @Field(type => Customer)
    customerInfo: Customer;

    @Field(type => String, { nullable: true })
    accessToken: string
}
@ObjectType()
export class LogoutType {
    @Field(type => Boolean)
    success: boolean
}