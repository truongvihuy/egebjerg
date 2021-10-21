import React, { useReducer, useEffect, useContext } from 'react';
import { CustomerContext } from 'contexts/customer/customer.context';
import { initializeApollo } from 'utils/apollo'
import { GET_LOGGED_IN_CUSTOMER, REFRESH_TOKEN } from 'graphql/query/customer.query';
import { GET_CUSTOMER_CHILD_INFO } from 'graphql/query/customer.query';
import { FirebaseContext } from 'contexts/firebase/firebase.context';
import toast from 'react-hot-toast';
import { setAccessToken } from 'utils/access-token';
import { handleJoin } from './customer.reducer';
import { CUSTOMER_TYPE } from 'config/constant';

export const getCustomerFromToken = (accessToken) => {
  return JSON.parse(atob(accessToken.split('.')[1]))
}

const isGroupAuthenticated = (accessTokenInfo) => {
  return accessTokenInfo ? (accessTokenInfo.customer_list ? true : false) : false;
}
const isNormalAuthenticated = (customerInfo) => {
  return customerInfo ? (customerInfo.customer_list ? (customerInfo.accessTokenInfo._id != customerInfo._id) : true) : false;
}

const isBrowser = typeof window !== 'undefined';
let isLogedIn = isBrowser ? localStorage.getItem('isLogedIn') : null;

// let sessionId = hasAccessToken ? accessTokenInfo.sessionId : null;
// if (hasAccessToken) {
//   if (!!accessTokenInfo.exp === false || (!!accessTokenInfo.exp && accessTokenInfo.exp < Math.ceil(+ new Date() / 1000))) {
//     localStorage.clear();
//     location.reload();
//   }
// }
// let customerInfo = hasAccessToken ? getCustomerFromLocalStorage() : null;

// let INITIAL_STATE = {
//   _id: null,
//   isNormalAuthenticated: isNormalAuthenticated(customerInfo),
//   isGroupAuthenticated: isGroupAuthenticated(accessTokenInfo),
//   groupCustomerList: accessTokenInfo && accessTokenInfo.customer_list ? accessTokenInfo.customer_list : null,
//   accessToken,
//   sessionId,
//   accessTokenInfo,
//   isBrowser,
//   schedules,
// };
type Action =
  | { type: 'HANDLE_ON_INPUT_CHANGE'; payload: any }
  | { type: 'ADD_CARD'; payload: any }
  | { type: 'DELETE_CARD'; payload: any }
  | { type: 'DELETE_MEMBERSHIP_NUMBER'; payload: any }
  | { type: 'SET_PRIMARY_CARD'; payload: any }
  | { type: 'ADD_FAVORITE_PRODUCT'; payload: any }
  | { type: 'REMOVE_FAVORITE_PRODUCT'; payload: any }
  | { type: 'SIGNIN'; payload: any }
  | { type: 'SIGNIN_SUCCESS'; payload: any }
  | { type: 'SIGN_OUT'; payload: any }
  | { type: 'SYNC_FAVORITE_MOST_BOUGHT_LIST'; payload: any }
  ;

function reducer(state: any, action: Action): any {
  switch (action.type) {
    case 'SIGNIN_SUCCESS':
      let {
        accessTokenInfo,
        isNormalAuthenticated,
        isGroupAuthenticated,
        groupCustomerList,
        sessionId,
        accessToken
      } = state;

      if (action.payload.accessToken) {
        accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken)
        accessTokenInfo = getCustomerFromToken(action.payload.accessToken);
        sessionId = accessTokenInfo.sessionId;
      }
      if ((action.payload.customerInfo?.type ?? state.type) == CUSTOMER_TYPE.admin) {
        isGroupAuthenticated = true;
        isNormalAuthenticated = false;
        groupCustomerList = action.payload.customerInfo.customer_list;
      } else {
        //action.payload.isNormalAuthenticated from handleParentAccount()
        if (accessTokenInfo.type == CUSTOMER_TYPE.admin) {
          isGroupAuthenticated = true;
          groupCustomerList = accessTokenInfo.customer_list;
        }
        isNormalAuthenticated = action.payload.isNormalAuthenticated ?? true;
      }
      localStorage.setItem('isLogedIn', isNormalAuthenticated ? 'normal' : (isGroupAuthenticated ? 'group' : ''));

      let newState = {};
      if (action.payload.customerInfo) {
        newState = {
          ...state,
          ...action.payload.customerInfo,
          accessToken,
          accessTokenInfo,
          isNormalAuthenticated,
          isGroupAuthenticated,
          groupCustomerList,
          sessionId
        };
      } else {
        newState = {
          ...state,
          ...action.payload,
          accessToken,
          accessTokenInfo,
          isNormalAuthenticated,
          isGroupAuthenticated,
          groupCustomerList,
          sessionId
        };
      }
      return newState;
    case 'SIGN_OUT':
      localStorage.clear();
      setAccessToken(null);
      return {
        accessToken: null,
        accessTokenInfo: null,
        groupCustomerList: null,
        isNormalAuthenticated: false,
        isGroupAuthenticated: false,
        sessionId: null,
      };
    case 'HANDLE_ON_INPUT_CHANGE':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case 'ADD_CARD':
      const newCard = {
        _id: action.payload._id,
        type: state.card.length === '0' ? 'primary' : 'secondary',
        cardType: action.payload.cardType,
        name: action.payload.name,
        lastFourDigit: action.payload.lastFourDigit,
      };
      return {
        ...state,
        card: [newCard, ...state.card],
      };
    case 'DELETE_CARD':
      return {
        ...state,
        card: state.card.filter((item: any) => item._id !== action.payload),
      };

    case 'DELETE_MEMBERSHIP_NUMBER':
      return {
        ...state,
        membership_number: null
        // member: state.member.filter((item: any) => item.id !== action.payload),
      };
    case 'SET_PRIMARY_CARD':
      let newCardSetPrimary = state.card.map((item: any) =>
        item._id === action.payload
          ? { ...item, type: 'primary' }
          : { ...item, type: 'secondary' }
      );
      return {
        ...state,
        card: newCardSetPrimary
      };
    case 'ADD_FAVORITE_PRODUCT':
      return {
        ...state,
        favorite_list: [...(state.favorite_list ?? []), action.payload]
      };
    case 'REMOVE_FAVORITE_PRODUCT':
      return {
        ...state,
        favorite_list: state.favorite_list?.filter(product_id => product_id !== action.payload) ?? [],
      };
    default:
      return state;
  }
}

export const CustomerProvider: React.FunctionComponent = ({ children }) => {
  const { firebaseDispatch } = useContext<any>(FirebaseContext);
  // let [customerState, customerDispatch] = [{
  //   _id: null,
  //   sessionId: null,
  //   isNormalAuthenticated: false,
  // }, null];
  const [customerState, customerDispatch] = useReducer(reducer, {});

  const getCustomerInfo = async (params) => {
    const {
      thisSessionId,
      newSnapshot,
      firstTime,
      customerState
    } = params;
    const newSessionId = newSnapshot ? newSnapshot[0] : null;
    if (!firstTime && thisSessionId != newSessionId) {
      try {
        const apolloClient = initializeApollo();

        /** Firebase issue: 
         * - Using Chrome, login by group account, select customer A
         * - Using Firefox, login by customer A
         * - On Firefox, browse Profile page, edit anything. 
         * - Firebase on Chrome will fire event to get new information but AccessToken on Chrome belongs to Group account, not Customer A
         * So we must get info from Customer A (Child account), not Group Account
        */
        if (customerState?.isGroupAuthenticated) {
          let customer = await apolloClient.query({
            query: GET_CUSTOMER_CHILD_INFO,
            fetchPolicy: 'network-only',
            variables: {
              customer_id: customerState._id
            }
          });
          customerDispatch({
            type: 'SIGNIN_SUCCESS', payload: customer.data.getChildCustomer
          });
        } else {
          let customer = await apolloClient.query({
            query: GET_LOGGED_IN_CUSTOMER,
            fetchPolicy: 'network-only'
          });
          customerDispatch({
            type: 'SIGNIN_SUCCESS', payload: customer.data.getCustomer
          });
        }
      } catch (e) {
        toast.error('Automatisk login mislykkes. Log ind');
        handleJoin();
        return;
      }
    }
  };

  useEffect(() => {
    if (isLogedIn) {
      getCustomerInfo({
        thisSessionId: 1,
        firstTime: false
      });
    }
  }, []);

  useEffect(() => {
    if (isLogedIn) {
      if (customerState.isNormalAuthenticated) {
        firebaseDispatch({ type: 'REF_ON', payload: { route: `customer/${customerState._id}`, callback: getCustomerInfo, sessionId: customerState.sessionId, customerState: customerState } })
      }
      return () => {
        firebaseDispatch({ type: 'REF_OFF', payload: { route: `customer/${customerState._id}` } });
      }
    }
  }, [customerState._id]);
  return <CustomerContext.Provider value={{ customerState, customerDispatch }}>
    {children}
  </CustomerContext.Provider>
};