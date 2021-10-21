import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import RadioGroup from 'components/radio-group/radio-group';
import RadioCard from 'components/radio-card/radio-card';
import { Button } from 'components/button/button';
import { handleModal } from 'features/checkouts/checkout-modal';
import { CustomerContext } from 'contexts/customer/customer.context';
import ModalCreateOrUpdateProfile from 'components/single-field-form/single-field-form';
import { useMutation } from '@apollo/client';
import { UPDATE_ME } from 'graphql/mutation/me';
import { CardHeader } from 'components/card-header/card-header';
import { ButtonGroup } from 'components/button-group/button-group';
import { Plus } from 'assets/icons/PlusMinus';
import { ConfirmModal } from 'components/modal/confirm-modal';
import { closeModal } from '@redq/reuse-modal';

interface Props {
  increment?: boolean;
  flexStart?: boolean;
  icon?: boolean;
  buttonProps?: any;
}

const Membership = ({
  increment = false,
  flexStart = false,
  icon = false,
  buttonProps = {
    size: 'big',
    variant: 'outlined',
    type: 'button',
    className: 'add-button',
  },
}: Props) => {
  const [updateMeMutation] = useMutation(UPDATE_ME);

  const {
    customerState,
    customerState: { membership_number, accessToken },
    customerDispatch,
  } = useContext<any>(CustomerContext);

  const handleOnDelete = async (item) => {
    const onSubmit = async () => {
      customerDispatch({ type: 'DELETE_MEMBERSHIP_NUMBER', payload: item });
      await updateMeMutation(
        {
          variables: { meInput: JSON.stringify({ membership_number: null }) }
        }
      )
      customerDispatch({
        type: 'HANDLE_ON_INPUT_CHANGE',
        payload: { value: null, field: 'membership_number' },
      });
      closeModal();
    }
    handleModal(ConfirmModal, {
      text: 'Slet medlemsnummeret ?',
      type: 'delete',
      onSubmit,
    });
  };
  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage
          id='memberCardText'
          defaultMessage='Barcode number on Coop membership card'
        />
      </CardHeader>
      {membership_number ? (<ButtonGroup flexStart={flexStart}>
        <RadioGroup
          itemList={[membership_number]}
          component={(item: any) => (
            <RadioCard
              id={item}
              key={item}
              title={''}
              content={[item]}
              checked={true}
              onChange={null}
              name='member'
              hasEdit={customerState.isNormalAuthenticated}
              hasDelete={customerState.isNormalAuthenticated}
              onEdit={() => handleModal(ModalCreateOrUpdateProfile, { value: item, field: 'membership_number', title: 'Rediger stregkodenummer' })}
              onDelete={() => handleOnDelete(item)}
            />
          )}
        />
      </ButtonGroup>) :
        (
          <Button
            variant="text"
            type="button"
            onClick={() => handleModal(ModalCreateOrUpdateProfile, { field: 'membership_number', title: 'Tilføj stregkodenummer' })}
            className="addCard"
          >
            <Plus width="10px" />&nbsp;&nbsp;
            <FormattedMessage id="addMemberBtn" defaultMessage="Add Member" />
          </Button>
        )
      }
    </>
  );
};

export default Membership;
