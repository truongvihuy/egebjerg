import React, { useContext, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { SEO } from 'components/seo';
import { Modal } from '@redq/reuse-modal';
import dynamic from 'next/dynamic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { CustomerContext } from 'contexts/customer/customer.context';
import {
  StyledPageWrapper,
} from 'assets/styles/pages.style';

import { customerReducer } from 'contexts/customer/customer.reducer';

import { convertUnixTime } from '../../../share/time.helper';

import Footer from 'layouts/footer';
import { ConfirmModal } from 'components/modal/confirm-modal';
import { handleModal } from 'features/checkouts/checkout-modal';
import { closeModal } from '@redq/reuse-modal';

import toast from 'react-hot-toast';
import { useIntl } from 'react-intl';

const ErrorMessage = dynamic(() =>
  import('components/error-message/error-message')
);
const StyledTitle = styled.h1`
  text-align: center;
  color: #009E7F;
  font-size:21px;

  @media (max-width: 989px) {
    padding: 30px;
  }
`;
const StyledWrapper = styled.div`
  align-items: center;
  display:flex;
  justify-content: initial;
  background-color: #ffffff;
  margin: 10px auto;

  @media (min-width: 989px) {
    width: 50%;
  }
`;
const StyledCustomerName = styled.div`
  padding: 10px 10px;
  font-weight:700;
`;
const StyledCustomerAction = styled.div`
  padding: 23px 30px;
  margin-left:auto;
`;
type AccountProps = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};
const CustomerListPage: NextPage<AccountProps> = ({ deviceType }) => {
  const {
    handleChildAccount,
    handleUnsubcribe,
    refreshCustomerList
  } = customerReducer();

  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const intl = useIntl();

  const [isGroupAuthenticated, setIsGroupAuthenticated] = useState(false);

  useEffect(() => {
    if (customerState.isGroupAuthenticated) {
      refreshCustomerList();
    }
    setIsGroupAuthenticated(customerState.isGroupAuthenticated);
  }, [customerState.isGroupAuthenticated]);

  const onUnsubscribe = userId => {
    const onSubmit = () => {
      toast.promise(
        handleUnsubcribe(userId),
        {
          loading: intl.formatMessage({ id: 'loading', defaultMessage: 'Loading !!!' }),
          success: (response) => {
            let index = customerState.customer_list.map(x => { return x._id }).indexOf(userId);
            let userList = JSON.parse(JSON.stringify(customerState.customer_list));
            userList[index] = response.data.unsubcribe;
            customerDispatch({
              type: 'SIGNIN_SUCCESS', payload: {
                userInfo: {
                  customer_list: userList
                }
              }
            });
            return intl.formatMessage({ id: 'success', defaultMessage: 'Success !!!' });
          },
          error: (err) => {
            return intl.formatMessage({ id: 'failMsg', defaultMessage: 'Error. Please contact the administrator!' });
          }
        })
      closeModal();
    }
    handleModal(ConfirmModal, {
      //Are you sure that the citizen in question does not want goods this week?
      text: 'Er du sikker på at den pågældende borger ikke ønsker varer i denne uge?',
      type: 'confirm',
      onSubmit
    });
  }

  if (isGroupAuthenticated && customerState.groupCustomerList) {
    let userList = customerState.groupCustomerList;
    userList = userList.slice().sort((x, y) => { return (x.name > y.name) ? 1 : -1 });
    return (
      <Modal>
        <SEO title='Konto' description='Konto' />
        <StyledPageWrapper>
          <StyledTitle>
            <FormattedMessage id='title-account-page' defaultMessage={'Name'} />
          </StyledTitle>
          {userList.map(user => {
            return (
              <StyledWrapper key={user._id} unique-key={user._id}>
                <StyledCustomerName
                  className="can-click"
                  onClick={
                    () => handleChildAccount(user._id)
                  }
                >{user.name}</StyledCustomerName>
                {
                  !!user.unsubcribe ?
                    <StyledCustomerAction>Fravalgt {convertUnixTime(user.unsubcribe)}</StyledCustomerAction>
                    :
                    <StyledCustomerAction
                      className="can-click"
                      onClick={
                        () => onUnsubscribe(user._id)
                      }
                    >Klik her for at fravælge ordre</StyledCustomerAction>
                }
              </StyledWrapper>
            )
          })}
          <Footer />
        </StyledPageWrapper>
      </Modal>
    )
  }

  return null
};
export default CustomerListPage;
