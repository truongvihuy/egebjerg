import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query getOrders(
    $limit: Int,
    $offset: Int,
    $customer_id: Int,
    $order_id: Int,
    $position: Int,
  ) {
    orders(
      limit: $limit,
      offset: $offset,
      customer_id: $customer_id,
      order_id: $order_id,
      position: $position,
    ) {
      items {
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
      }
      total
    }
  }
`;

export const GET_ORDER_BY_SESSION = gql`
  query getOrderBySession(
    $session: String!,
  ) {
    orderBySession(
      session: $session,
    ) {
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
    }
  }
`;