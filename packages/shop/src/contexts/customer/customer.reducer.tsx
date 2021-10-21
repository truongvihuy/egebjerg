import React from 'react';
import Router, { useRouter } from 'next/router';
import { openModal } from '@redq/reuse-modal';
import { CustomerContext } from 'contexts/customer/customer.context';
import AuthenticationForm from 'features/authentication-form';
import { useCart } from 'contexts/cart/use-cart';
import { initializeApollo } from 'utils/apollo'
import { MUST_LOGIN_PAGE_LIST } from 'config/site-navigation';
import { GET_CUSTOMER_CHILD_INFO, UNSUBCRIBE_CUSTOMER, GET_CUSTOMER_LIST } from 'graphql/query/customer.query';
import { GET_LOGGED_IN_CUSTOMER } from 'graphql/query/customer.query';
import { LOG_OUT } from 'graphql/query/customer.query';

export const handleJoin = () => {
  console.info('action', 'Login');
  openModal({
    show: true,
    overlayClassName: 'quick-view-overlay',
    closeOnClickOutside: true,
    component: AuthenticationForm,
    closeComponent: '',
    config: {
      enableResizing: false,
      disableDragging: true,
      className: 'quick-view-modal',
      width: 458,
      height: 'auto',
    },
  });
};

export const customerReducer = () => {
  const { clearCart } = useCart();
  const { pathname, query, push: routerPush } = useRouter();
  const {
    customerState,
    customerDispatch,
  } = React.useContext<any>(CustomerContext);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      clearCart();
      const apolloClient = initializeApollo();
      await apolloClient.query({ query: LOG_OUT, fetchPolicy: 'network-only' });
      customerDispatch({ type: 'SIGN_OUT' });

      // When customer are viewing page which not related to customer like category, product-detail, terms, etc, we needn't to redirect them to index page
      if (MUST_LOGIN_PAGE_LIST.includes(pathname)) {
        routerPush('/');
      } else {
        Router.push({
          pathname: pathname,
          query: query,
        });
      }
    }
  };

  const handleChildAccount = async (customer_id) => {
    const apolloClient = initializeApollo();
    await apolloClient.cache.reset();
    let customer = await apolloClient.query({
      query: GET_CUSTOMER_CHILD_INFO,
      variables: {
        customer_id
      },
      fetchPolicy: 'network-only'
    });
    if (customer.data.getChildCustomer) {
      await clearCart();
      await customerDispatch({
        type: 'SIGNIN_SUCCESS', payload: customer.data.getChildCustomer
      });
      Router.push('/');
    }
  }
  const handleParentAccount = async (customerListPage = '') => {
    const apolloClient = initializeApollo();
    let customer = await apolloClient.query({
      query: GET_LOGGED_IN_CUSTOMER,
      fetchPolicy: 'network-only'
    });
    if (customer.data.getCustomer) {
      await clearCart();
      await customerDispatch({
        type: 'SIGNIN_SUCCESS', payload: {
          ...customer.data.getCustomer,
          isNormalAuthenticated: false,
          isGroupAuthenticated: true
        }
      });
      if (customerListPage) {
        Router.push(customerListPage);
      }
    }
  }

  const handleUnsubcribe = async (customerId) => {
    const apolloClient = initializeApollo();
    return apolloClient.mutate(
      {
        mutation: UNSUBCRIBE_CUSTOMER,
        variables: {
          customer_id: customerId
        }
      }
    );


  }

  const refreshCustomerList = async () => {
    const apolloClient = initializeApollo();
    let response = await apolloClient.query(
      {
        query: GET_CUSTOMER_LIST,
        fetchPolicy: 'network-only'
      }
    );
    await customerDispatch({
      type: 'SIGNIN_SUCCESS', payload: {
        customerInfo: {
          customer_list: response.data.getCustomerList.customer_list
        }
      }
    });

  }

  return {
    handleLogout,
    handleJoin,
    handleChildAccount,
    handleParentAccount,
    handleUnsubcribe,
    refreshCustomerList
  }
}