import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import RadioCard from 'components/radio-card/radio-card';
import { CustomerContext } from 'contexts/customer/customer.context';
import { CardHeader } from 'components/card-header/card-header';

interface Props {
  increment?: boolean;
  icon?: boolean;
  buttonProps?: any;
  flexStart?: boolean;
}

const Store = ({
  increment = false,
  flexStart = false,
}: Props) => {
  const { customerState } = useContext<any>(CustomerContext);
  const { store, store_zip_code } = customerState;
  if (!customerState._id) {
    return null;
  }

  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage id='checkoutDeliveryStore' defaultMessage='Delivery Store Infomation' />
      </CardHeader>
      <RadioCard
        id='store'
        content={[
          "Navn: " + store.name,
          "Adresse: " + store.address,
          "Postnr: " + store_zip_code.zip_code ?? '',
          "By: " + store_zip_code.city_name ?? '',
          "Email: " + store.checkout_info?.email ?? '',
          "Mobil: " + store.checkout_info?.phone ?? '',
          "CVR Nummer: " + store.checkout_info?.cvr_number ?? '',
        ]}
        name='store'
        checked={true}
        disabled
        hasDelete={false}
        hasEdit={false}
      />
    </>
  );
};
export default Store;
