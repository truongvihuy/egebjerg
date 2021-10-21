import { gql } from '@apollo/client';

export const UPDATE_ME = gql`
  mutation(
    $meInput: String!
    $customer_id: Int
  ) {
    updateMe(
      meInput: $meInput
      customer_id: $customer_id
    ) {
      _id
      name
      email
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  mutation(
    $oldPassword: String!
    $password: String!,
    $customer_id: Int
  ) {
    updatePassword(
      oldPassword: $oldPassword
      password: $password,
      customer_id: $customer_id
    ) {
      _id
      name
      email
    }
  }
`;
