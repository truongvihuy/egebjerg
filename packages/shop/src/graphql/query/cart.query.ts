import { gql } from '@apollo/client';
import { cartSchema } from 'graphql/default-schema/cart';

export const UPDATE_CART = gql`
  mutation updateCartCustomer(
    $_id: Int!,
    $name: String,
    $quantity: Int,
    $quantity_list: [Int!],
    $note: String,
    $position: Int,
    $weight_option_list: [Int],
    $price: Float,
  ) {
    updateCart(
      _id: $_id
      name: $name
      quantity: $quantity
      quantity_list: $quantity_list
      note: $note
      position: $position
      weight_option_list: $weight_option_list
      price: $price
    ) {
      ${cartSchema}
    }
  }
`;

export const UPDATE_CART_MULTI = gql`
  mutation updateCartCustomerMulti(
    $product_list: [ItemCartInput!]!,
  ) {
    updateCartMulti(
      product_list: $product_list
    ) {
      product_list {
        ${cartSchema}
      }
    }
  }
`;

export const UPDATE_CART_NOTE = gql`
  mutation updateCartNoteCustomer(
    $note: String,
  ) {
    updateCartNote(
      note: $note
    ) {
      note
    }
  }
`;

export const GET_CART = gql`
  query getCartCustomer {
    getCart {
      product_list {
        ${cartSchema}
      }
      note
      order_id
    }
  }
`;