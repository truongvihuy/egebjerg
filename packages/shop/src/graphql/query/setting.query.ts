import { gql } from '@apollo/client';

export const GET_SETTING = gql`
  query {
    settings {
      _id
      key
      name
      value
    }
  }
`;