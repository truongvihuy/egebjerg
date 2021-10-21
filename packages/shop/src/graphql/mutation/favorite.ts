import { gql } from '@apollo/client';
import { customerSchema } from '../default-schema/customer';

export const ADD_FAVORITE_PRODUCT = gql`
  mutation(
    $product_id: Int!,
    $customer_id: Int
    ) {
    addFavoriteProduct(
      product_id: $product_id
      customer_id: $customer_id
      ) {
        ${customerSchema}
      }
  }
`;

export const REMOVE_FAVORITE_PRODUCT = gql`
  mutation(
    $product_id: Int!,
    $customer_id: Int
    ) {
    removeFavoriteProduct(
      product_id: $product_id
      customer_id: $customer_id
    ) {
      ${customerSchema}
    }
  }
`;