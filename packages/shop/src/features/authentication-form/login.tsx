import React, { useContext } from 'react';
import {
  Button,
  Wrapper,
  Container,
  Heading,
  SubHeading,
  Offer,
} from './authentication-form.style';
import { CustomerContext } from 'contexts/customer/customer.context';
import { FormattedMessage, useIntl } from 'react-intl';
import { closeModal } from '@redq/reuse-modal';
import { Input } from 'components/forms/input';
import Link from 'next/link';
import { GET_LOGGED_IN_CUSTOMER } from 'graphql/query/customer.query';
import ErrorMessage from 'components/error-message/error-message';
import { initializeApollo } from 'utils/apollo';

import Router from 'next/router';
import { WRONG_ACCOUNT_LOGIN_MSG } from '../../../../share/constant';

export default function SignInModal() {
  const intl = useIntl();
  const { customerDispatch } = useContext<any>(CustomerContext);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const loginCallback = async (e) => {
    if (typeof window !== 'undefined') {
      e.preventDefault();
      const apolloClient = initializeApollo();
      try {
        let customer = await apolloClient.query({
          query: GET_LOGGED_IN_CUSTOMER,
          context: {
            headers: {
              authorization: 'Basic ' + btoa(email + ":" + password)
            }
          },
          fetchPolicy: 'network-only'
        });
        if (customer.data) {
          customerDispatch({
            type: 'SIGNIN_SUCCESS', payload: customer.data.getCustomer
          });
          closeModal();
          if (customer.data.getCustomer.customerInfo.customer_list && customer.data.getCustomer.customerInfo.customer_list.length > 0) {
            Router.push('/customer-list');
          } else {
            Router.push({
              pathname: Router.pathname,
              query: Router.query,
            });
          }
        } else {
          customer.errors.forEach(error => {
            setMessage(error.message)
          })
        }
      } catch (e) {
        setMessage(WRONG_ACCOUNT_LOGIN_MSG)
      }
    }
  };
  return (
    <Wrapper>
      <Container>
        <Heading>
          <FormattedMessage id='welcome' defaultMessage='Welcome' />
        </Heading>

        <SubHeading>
          <FormattedMessage
            id='loginText'
            defaultMessage='Login with your email &amp; password'
          />
        </SubHeading>
        <form onSubmit={e => loginCallback(e)}>
          <Input
            type='text'
            placeholder={intl.formatMessage({
              id: 'emailAddressPlaceholder',
              defaultMessage: 'Customername or Email Address',
            })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            height='48px'
            backgroundColor='#F7F7F7'
            autoFocus={true}
            autocapitalize='off'
            mb='10px'
          />

          <Input
            type='password'
            placeholder={intl.formatMessage({
              id: 'passwordPlaceholder',
              defaultMessage: 'Password (min 6 characters)',
            })}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            height='48px'
            backgroundColor='#F7F7F7'
            mb='10px'
          />
          <ErrorMessage message={message} />
          <Button
            variant='primary'
            size='big'
            style={{ width: '100%' }}
            type='submit'
          >
            <FormattedMessage id='loginBtn' defaultMessage='Login' />
          </Button>
        </form>

        <Offer style={{ padding: '20px 0' }}>
          <FormattedMessage
            id='dontHaveAccount'
            defaultMessage="Don't have any account?"
          />{' '} <Link href='/contact'>
            <a>
              <FormattedMessage
                id='contactUs'
                defaultMessage="Contact us"
              />
            </a>
          </Link> {' '} <FormattedMessage
            id='toGetLoginInfo'
            defaultMessage="to get login information"
          />
        </Offer>
      </Container>

      {/* <OfferSection>
        <Offer>
          <FormattedMessage
            id='forgotPasswordText'
            defaultMessage='Forgot your password?'
          />{' '}
          <LinkButton onClick={toggleForgotPassForm}>
            <FormattedMessage id='resetText' defaultMessage='Reset It' />
          </LinkButton>
        </Offer>
      </OfferSection> */}
    </Wrapper>
  );
}