import { gql } from '@apollo/client';

export const ADD_ORDER = gql`
  mutation($orderInput: String!) {
    addOrder(orderInput: $orderInput) {
      _id
      status
      address_info {
        address
        city
        zip_code
      }
      created_date
      position
      payment_method
      product_list {
        _id
        image
        name
        weight
        quantity
        price
        discount
        total
      }
      subtotal
      discount
      delivery_fee
      total_weight
      overweight_fee
      amount
      payment_url
    }
  }
`;

export const GET_PAYMENT = gql`
  mutation($paymentInput: String!) {
    charge(paymentInput: $paymentInput) {
      status
    }
  }
`;
