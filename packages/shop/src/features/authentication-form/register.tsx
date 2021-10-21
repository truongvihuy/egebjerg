import React, { useContext } from 'react';
import Link from 'next/link';
import { Input } from 'components/forms/input';
import {
  Button,
  Wrapper,
  Container,
  Heading,
  SubHeading,
  HelperText,
  Offer,
  // Input,
  LinkButton,
} from './authentication-form.style';
import { CustomerContext } from 'contexts/customer/customer.context';
import { FormattedMessage, useIntl } from 'react-intl';

export default function SignOutModal() {
  const intl = useIntl();
  const { customerDispatch } = useContext<any>(CustomerContext);

  const toggleSignInForm = () => {
    customerDispatch({
      type: 'SIGNIN',
    });
  };

  return (
    <Wrapper>
      <Container>
        <Heading>
          <FormattedMessage id='signUpBtnText' defaultMessage='Sign Up' />
        </Heading>
        <SubHeading>
          <FormattedMessage
            id='signUpText'
            defaultMessage='Every fill is required in sign up'
          />
        </SubHeading>
        <Input
          type='text'
          placeholder={intl.formatMessage({
            id: 'emailAddressPlaceholder',
            defaultMessage: 'Email Address or Contact No.',
          })}
          height='48px'
          backgroundColor='#F7F7F7'
          mb='10px'
        />
        <Input
          type='email'
          placeholder={intl.formatMessage({
            id: 'passwordPlaceholder',
            defaultMessage: 'Password (min 6 characters)',
          })}
          height='48px'
          backgroundColor='#F7F7F7'
          mb='10px'
        />
        <HelperText style={{ padding: '20px 0 30px' }}>
          <FormattedMessage
            id='signUpText'
            defaultMessage="By signing up, you agree to Pickbazar's"
          />
          &nbsp;
          <Link href='/'>
            <a>
              <FormattedMessage
                id='termsConditionText'
                defaultMessage='Terms &amp; Condition'
              />
            </a>
          </Link>
        </HelperText>
        <Button variant='primary' size='big' width='100%' type='submit'>
          <FormattedMessage id='continueBtn' defaultMessage='Continue' />
        </Button>

        <Offer style={{ padding: '20px 0' }}>
          <FormattedMessage
            id='alreadyHaveAccount'
            defaultMessage='Already have an account?'
          />{' '}
          <LinkButton onClick={toggleSignInForm}>
            <FormattedMessage id='loginBtnText' defaultMessage='Login' />
          </LinkButton>
        </Offer>
      </Container>
    </Wrapper>
  );
}
