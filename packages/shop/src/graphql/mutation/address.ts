import { gql } from '@apollo/client';

export const UPDATE_ADDRESS = gql`
  mutation($addressInput: String!) {
    updateAddress(addressInput: $addressInput) {
      _id
      name
      address {
        _id
        name
        info
      }
    }
  }
`;
