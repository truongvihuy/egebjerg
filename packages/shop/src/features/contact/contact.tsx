import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import RadioGroup from 'components/radio-group/radio-group';
import RadioCard from 'components/radio-card/radio-card';
import { CustomerContext } from 'contexts/customer/customer.context';
import { useMutation } from '@apollo/client';
import { DELETE_CONTACT } from 'graphql/mutation/contact';
import { CardHeader } from 'components/card-header/card-header';
import { ButtonGroup } from 'components/button-group/button-group';
interface Props {
  display?: string;
  increment?: boolean;
  flexStart?: boolean;
  icon?: boolean;
  buttonProps?: any;
}

const Contact = ({
  display = 'flex',
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
  const [deleteContactMutation] = useMutation(DELETE_CONTACT);

  const {
    customerState: { phone },
    customerDispatch,
  } = useContext<any>(CustomerContext);

  const handleOnDelete = async (item) => {
    customerDispatch({ type: 'DELETE_CONTACT', payload: item.id });
    return await deleteContactMutation({
      variables: { contactId: JSON.stringify(item.id) },
    });
  };
  return (
    <>
      <CardHeader increment={increment}>
        <FormattedMessage
          id='contactNumberText'
          defaultMessage='Select Your Contact Number'
        />
      </CardHeader>
      <ButtonGroup flexStart={flexStart} display={display}>
        <RadioGroup
          itemList={phone}
          component={(item: any, index) => (
            <RadioCard
              key={index}
              content={item}
              checked={true}
              onChange={null}
              disabled={true}
              name='contact'
              hasEdit={false}
              hasDelete={false}
            />
          )}
        />
      </ButtonGroup>
    </>
  );
};

export default Contact;
