import { CustomerContext } from 'contexts/customer/customer.context';
import { useContext } from 'react';
import YesNoOptions from 'features/yes-no-options/yes-no-options';
import Payment from 'features/payment/payment';
import { CardHeader } from 'components/card-header/card-header';
import { FormattedMessage } from 'react-intl';
import { PAYMENT_METHOD_CARD, PAYMENT_METHOD_PBS } from 'config/constant';
import { useMutation } from '@apollo/client';
import { UPDATE_ME } from 'graphql/mutation/me';

const PaymentMethod = ({ addCard = true, increment = false, deviceType, responsive, useOtherCard = false }) => {
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const [updateMeMutation] = useMutation(UPDATE_ME);

  const handleChangeYesNoOption = (field, value) => {
    updateMeMutation(
      {
        variables: { meInput: JSON.stringify({ [field]: value }) }
      }
    ).then((response) => {
      if (response.data) {
        customerDispatch({
          type: 'HANDLE_ON_INPUT_CHANGE',
          payload: { value, field },
        });
      }
    });
  }

  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage id='selectPaymentText' defaultMessage='Payment Option' />
      </CardHeader>
      <YesNoOptions titleId='paymentPBSTitle'
        flag={customerState.payment_method === PAYMENT_METHOD_PBS} handleChangeOption={(value) => handleChangeYesNoOption('payment_method', value ? PAYMENT_METHOD_PBS : PAYMENT_METHOD_CARD)} />
      <YesNoOptions titleId='paymentCardTitle'
        flag={customerState.payment_method !== PAYMENT_METHOD_PBS} handleChangeOption={(value) => handleChangeYesNoOption('payment_method', value ? PAYMENT_METHOD_CARD : PAYMENT_METHOD_PBS)} />
      {customerState.payment_method === PAYMENT_METHOD_CARD && <Payment addCard={addCard} responsive={responsive} useOtherCard={useOtherCard} deviceType={deviceType} hiddenHeader={true} />}
    </>
  )

}

export default PaymentMethod;