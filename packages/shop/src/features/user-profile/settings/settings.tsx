import React, { useContext } from 'react';
import { useMutation } from '@apollo/client';
import { CustomerContext } from 'contexts/customer/customer.context';
import { closeModal } from '@redq/reuse-modal';

import {
  SettingsForm,
  SettingsFormContent,
  HeadingSection,
  Title,
  Col,
  Row,
  StyledInputWrapper
} from './settings.style';

import { Input } from 'components/forms/input';
import { FormattedMessage } from 'react-intl';
import { Label } from 'components/forms/label';
import Contact from 'features/contact/contact';
import Address from 'features/address/address';
import Membership from 'features/membership/membership';
import { PencilIcon } from 'assets/icons/PencilIcon';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { Plus } from 'assets/icons/PlusMinus';
import { ActionButton, ButtonWrapper } from 'components/radio-group/radio-group.style';
import { handleModal } from 'features/checkouts/checkout-modal';
import ModalCreateOrUpdateProfile from 'components/single-field-form/single-field-form';
import { Button } from 'components/button/button';
import { UPDATE_ME } from 'graphql/mutation/me';
import { ConfirmModal } from '../../../components/modal/confirm-modal';
import ReplacementGoods from 'features/replacement-goods/replacement-goods';
import { PAYMENT_METHOD_NO_PAYMENT } from 'config/constant';
import PaymentMethod from 'features/payment-method/payment-method';
type SettingsContentProps = {
  deviceType?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};

const SettingsContent: React.FC<SettingsContentProps> = ({ deviceType }) => {
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const { store } = customerState;
  if (!customerState.isNormalAuthenticated) {
    return null
  }

  const [updateMeMutation] = useMutation(UPDATE_ME);
  const handleDeleteProfileMe = (field) => {
    const onSubmit = async () => {
      await updateMeMutation(
        {
          variables: { meInput: JSON.stringify({ [field]: null }) }
        }
      )
      customerDispatch({
        type: 'HANDLE_ON_INPUT_CHANGE',
        payload: { value: null, field },
      });
      closeModal();
    };
    handleModal(ConfirmModal, {
      text: 'Slet e-mail ?',
      type: 'delete',
      onSubmit
    });
  }

  return (
    <SettingsForm>
      <SettingsFormContent>
        <HeadingSection>
          <Title>
            <FormattedMessage
              id="profilePageTitle"
              defaultMessage="Your Profile"
            />
          </Title>
        </HeadingSection>
        <Row>
          <Col xs={12} sm={5} md={5} lg={5}>
            <Label>
              <FormattedMessage
                id="profileNameField"
                defaultMessage="Your Name"
              />
            </Label>
            <StyledInputWrapper>
              <Input
                type="text"
                label="Name"
                name="name"
                value={customerState.name}
                height="48px"
                disabled
              />
            </StyledInputWrapper>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={5} md={5} lg={5}>
            <Label>
              <FormattedMessage
                id="profileUsernameField"
                defaultMessage="Username"
              />
            </Label>
            <StyledInputWrapper>
              <Input
                type="text"
                label="Username"
                name="username"
                value={customerState.username}
                height="48px"
                disabled
              />
            </StyledInputWrapper>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={5} md={5} lg={5}>
            <Label>
              <FormattedMessage
                id="profileEmailField"
                defaultMessage="Email"
              />
            </Label>
            {customerState.email ? (
              <StyledInputWrapper>
                <Input
                  style={{ cursor: 'pointer' }}
                  type="text"
                  label="Email"
                  name="email"
                  value={customerState.email}
                  // onChange={handleChange}
                  height="48px"
                  disabled
                />
                <ButtonWrapper className='button-wrapper'>
                  <ActionButton onClick={() => handleModal(ModalCreateOrUpdateProfile, { field: 'email', value: customerState.email, title: 'Rediger email' })} className='edit-btn'>
                    <PencilIcon />
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteProfileMe('email')} className='delete-btn'>
                    <CloseIcon />
                  </ActionButton>
                </ButtonWrapper>
              </StyledInputWrapper>
            ) : (
              <Button
                variant="text"
                type="button"
                onClick={() => handleModal(ModalCreateOrUpdateProfile, { field: 'email' })}
              >
                <Plus style={{ marginRight: '5px' }} />
                <FormattedMessage id="addEmail" defaultMessage="Add Email" />
              </Button>
            )}
          </Col>
        </Row>
        <Row style={{ alignItems: 'flex-end', marginBottom: '50px' }}>
          <Col xs={12} sm={5} md={5} lg={5}>
            <Label>
              <FormattedMessage
                id="profilePasswordField"
                defaultMessage="Password"
              />
            </Label>
            <Button
              variant="text"
              type="button"
              onClick={() => handleModal(ModalCreateOrUpdateProfile, { field: 'password', title: 'Rediger adgangskode' })}
            >
              <PencilIcon width={12} style={{ marginRight: '5px' }} />
              <FormattedMessage id="changePassword" defaultMessage="Change password" />
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={12} md={12} lg={12} style={{ position: 'relative' }}>
            <SettingsFormContent>
              <Address />
            </SettingsFormContent>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={12} md={12} lg={12}>
            <SettingsFormContent>
              <Contact flexStart={true} display='inline-flex' />
            </SettingsFormContent>
          </Col>
        </Row>

        <Row>
          <Col xs={12} sm={12} md={12} lg={12}>
            <SettingsFormContent>
              <Membership />
            </SettingsFormContent>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={5} md={5} lg={5}>
            <SettingsFormContent>
              <ReplacementGoods />
            </SettingsFormContent>
          </Col>
        </Row>
        {store.payment[0] !== PAYMENT_METHOD_NO_PAYMENT && (
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <SettingsFormContent>
                <PaymentMethod deviceType={deviceType} responsive={{
                  desktop: {
                    breakpoint: { max: 3000, min: 1024 },
                    items: 3,
                  },
                  tablet: {
                    breakpoint: { max: 1024, min: 464 },
                    items: 2,
                  },
                  mobile: {
                    breakpoint: { max: 464, min: 0 },
                    items: 1,
                  },
                }} />
              </SettingsFormContent>
            </Col>
          </Row>
        )}
      </SettingsFormContent>
    </SettingsForm>
  );
};

export default SettingsContent;
