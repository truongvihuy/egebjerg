import { gql } from '@apollo/client';

export const UPDATE_CONTACT = gql`
  mutation($contactInput: String!) {
    updateContact(contactInput: $contactInput) {
      _id
      name
      contact {
        _id
        type
        number
      }
    }
  }
`;
export const DELETE_CONTACT = gql`
  mutation($contactId: String!) {
    deleteContact(contactId: $contactId) {
      _id
      name
      contact {
        _id
        type
        number
      }
    }
  }
`;
