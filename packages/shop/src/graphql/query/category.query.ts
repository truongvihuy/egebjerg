import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query getCategories {
    categories {
      _id
      name
      slug
      img
      children
      children_direct
      parent_id
      level
      order
    }
  }
`;
