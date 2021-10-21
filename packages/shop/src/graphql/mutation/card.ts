import { gql } from '@apollo/client';

export const ADD_CARD = gql`
  mutation($cardInput: String!) {
    addPaymentCard(cardInput: $cardInput) {
      _id
      name
      card {
        _id
        type
        name
        cardType
        bin
        lastFourDigit
      }
    }
  }
`;
export const DELETE_CARD = gql`
  mutation($cardId: Int!) {
    deletePaymentCard(cardId: $cardId) {
      _id
      name
    }
  }
`;
export const UPDATE_PRIMARY_CARD = gql`
  mutation($cardId: Int!) {
    updatePrimaryPaymentCard(cardId: $cardId) {
      _id
      name
    }
  }
`;

export const GET_ADD_CARD_LINK = gql`
  mutation {
    getAddPaymentCardLink {
      url
    }
  }
`;
