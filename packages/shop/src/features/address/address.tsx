import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import RadioGroup from 'components/radio-group/radio-group';
import RadioCard from 'components/radio-card/radio-card';
import { CustomerContext } from 'contexts/customer/customer.context';
import { CardHeader } from 'components/card-header/card-header';
import { ButtonGroup } from 'components/button-group/button-group';

interface Props {
  increment?: boolean;
  icon?: boolean;
  buttonProps?: any;
  flexStart?: boolean;
}

const Address = ({
  increment = false,
  flexStart = false,
  buttonProps = {
    size: 'big',
    variant: 'outlined',
    type: 'button',
    className: 'add-button',
  },
  icon = false,
}: Props) => {
  const {
    customerState: { name, address, zip_code },
    customerDispatch,
  } = useContext<any>(CustomerContext);
  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage
          id='deliveryAddressTitle'
          defaultMessage='Select Your Delivery Address'
        />
      </CardHeader>
      <ButtonGroup flexStart={flexStart}>
        <RadioGroup
          itemList={[{}]}
          component={(item: any, index) => (
            <RadioCard
              key={index}
              // title={item.name == 'Home' ? 'Vigtigste' : "Kontor"}
              content={[
                name,
                address,
                `${zip_code.zip_code} ${zip_code.city_name}`,
              ]}
              name='address'
              checked={true}
              onChange={null}
              disabled
              hasDelete={false}
              hasEdit={false}
            />
          )}
        />
      </ButtonGroup>
    </>
  );
};
export default Address;
