import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { handleModal } from 'features/checkouts/checkout-modal';
import { openModal, closeModal } from '@redq/reuse-modal';
import { CustomerContext } from 'contexts/customer/customer.context';
import PaymentGroup from 'components/payment-group/payment-group';
import { useCart } from 'contexts/cart/use-cart';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_CARD, ADD_CARD, UPDATE_PRIMARY_CARD, GET_ADD_CARD_LINK } from 'graphql/mutation/card';
import { CardHeader } from 'components/card-header/card-header';
import { ConfirmModal } from '../../components/modal/confirm-modal';
import Router from 'next/router';
interface Props {
  deviceType: any;
  responsive: any;
  increment?: boolean;
  hiddenHeader?: boolean;
  useOtherCard?: boolean;
  addCard?: boolean;
}

const Payment = ({ deviceType, responsive, increment = false, hiddenHeader = false, useOtherCard = false, addCard = true }: Props) => {
  const [deletePaymentCardMutation] = useMutation(DELETE_CARD);
  const [updatePrimaryCardMutation] = useMutation(UPDATE_PRIMARY_CARD);
  const [getAddCardLink] = useMutation(GET_ADD_CARD_LINK);
  // const { calculatePrice } = useCart();

  const {
    customerState: { card, _id },
    customerDispatch,
  } = useContext<any>(CustomerContext);

  const handleOnDelete = async (item) => {
    handleModal(ConfirmModal, {
      text: 'Slet betalingskort?',
      type: 'delete',
      onSubmit: async () => {
        customerDispatch({ type: 'DELETE_CARD', payload: item._id });
        await deletePaymentCardMutation({
          variables: { cardId: item._id },
        });
        closeModal();
      }
    })
  };
  return (
    <>
      {!hiddenHeader &&
        <CardHeader increment={increment}>
          <FormattedMessage
            id="selectPaymentText"
            defaultMessage="Select Payment Option"
          />
        </CardHeader>
      }
      <PaymentGroup
        name="payment"
        responsive={responsive}
        useOtherCard={useOtherCard}
        deviceType={deviceType}
        items={card ?? []}
        onDelete={(item) => handleOnDelete(item)}
        onChange={async (item: any) => {
          /* await updatePrimaryCardMutation({
            variables: { cardId: item._id },
          });
          customerDispatch({
            type: 'SET_PRIMARY_CARD',
            payload: item._id,
          }) */
        }}
        addCard={addCard}
        handleAddNewCard={async () => {
          try {
            openModal({
              show: true,
              config: {
                width: 360,
                height: 'auto',
                enableResizing: false,
                disableDragging: true,
              },
              closeOnClickOutside: true,
              component: () => (
                <div style={{ padding: '20px' }}>Indlæser...</div>
              ),
              componentProps: {},
            });
            let response = await getAddCardLink();
            let url = response.data.getAddPaymentCardLink.url;
            Router.push(url);
          } catch (error) {
            console.log(error)
          }
          // handleModal(
          //   CardForm,
          //   { buttonText: 'Tilføj kort' },
          //   null,
          //   '1000px'//width
          // );
        }}
      />
    </>
  );
};

export default Payment;
