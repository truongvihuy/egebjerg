import { gql } from '@apollo/client';
import { customerSchema } from '../default-schema/customer';

export const GET_CUSTOMER_CHILD_INFO = gql`
  query getChildCustomer(
      $customer_id:Int!
    ) {
    getChildCustomer(
        customer_id: $customer_id
    ) {
      customerInfo {
        ${customerSchema}
        customer_list {
          _id
          username
          name
          unsubcribe
        }
      }
      accessToken
    }
  }
`;

export const UNSUBCRIBE_CUSTOMER = gql`
  mutation unsubcribe($customer_id: Int!) {
    unsubcribe(customer_id: $customer_id) {
      _id
      name
      unsubcribe
    }
  }
`;

export const GET_CUSTOMER_LIST = gql`
  query getCustomerList {
    getCustomerList {
      customer_list {
        _id
        username
        name
        unsubcribe
      }
    }
  }
`;

export const GET_FAVORITE_MOST_BOUGHT_LIST = gql`
  query getFavoriteMostBoughtList($customer_id: Int) {
    getFavoriteMostBoughtList(customer_id: $customer_id) {
      favorite_list
      most_bought_list
    }
  }
`;

export const LOG_OUT = gql`
  query logOut {
    logOut {
      success
    }
  }
`;

export const GET_LOGGED_IN_CUSTOMER = gql`
  query getCustomer {
    getCustomer {
      customerInfo {
        ${customerSchema}
        customer_list {
          _id
          username
          name
          unsubcribe
        }
      }
      accessToken
    }
  }
`;

export const REFRESH_TOKEN = gql`
  query refreshToken {
    refreshToken {
      customerInfo {
        ${customerSchema}
        customer_list {
          _id
          username
          name
          unsubcribe
        }
      }
      accessToken
    }
  }
`;