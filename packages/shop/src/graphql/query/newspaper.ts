import { gql } from '@apollo/client';

export const GET_NEWSPAPER_DETAIL = gql`
  query getNewspapers($_id: Int) {
    newspapers(_id: $_id) {
      _id
      name
      offer_list {
        offer_id_list
        product_id_list
        img_list {
          uid
          slug
        }
      }
      from
      to
      active
      total_page
    } 
  }
`;

export const GET_NEWSPAPER = gql`
  query {
    newspapers {
      _id
      name
    }
  }
`;