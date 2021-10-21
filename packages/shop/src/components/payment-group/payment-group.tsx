import React from 'react';
import { FormattedMessage } from 'react-intl';
import Carousel from 'components/carousel/carousel';
import PaymentCard from '../payment-card/payment-card';
import { Plus } from 'assets/icons/PlusMinus';
import { Button } from 'components/button/button';
import {
  Header,
  PaymentCardList,
  IconWrapper,
  SavedCard,
  OtherPayOption,
} from './payment-group.style';

interface PaymentCardType {
  id: number | string;
  type: string;
  lastFourDigit: string;
  name: string;
}

interface PaymentOptionType {
  showCard?: boolean;
  addedCard?: PaymentCardType[];
  mobileWallet?: boolean;
  cashOnDelivery?: boolean;
}

interface PaymentGroupProps {
  id?: any;
  deviceType?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  responsive: any;
  name: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  value?: string;
  onChange: Function;
  items: any;
  onDelete: any;
  handleAddNewCard: any;
  useOtherCard?: boolean;
  addCard?: boolean;
}

const PaymentGroup: React.FunctionComponent<PaymentGroupProps> = ({
  items,
  responsive,
  deviceType,
  className,
  name,
  onChange,
  onDelete,
  handleAddNewCard,
  useOtherCard = false,
  addCard = true
}) => {
  // RadioGroup State

  // Handle onChange Func
  const handleChange = (item: any) => {
    onChange(item);
  };
  if (!items) {
    return null;
  }
  return (
    <>
      {/* {deviceType === 'desktop' && ( */}
      <Header>
        {items.length !== 0 && (
          <SavedCard>
            <FormattedMessage id="savedCardsId" defaultMessage="Saved Cards" />
          </SavedCard>
        )}
        {items.length == 0 && addCard && (
          <Button
            variant="text"
            type="button"
            onClick={handleAddNewCard}
            className="addCard"
          >
            <IconWrapper>
              <Plus width="10px" />
            </IconWrapper>
            <FormattedMessage id="addCardBtn" defaultMessage="Add Card" />
          </Button>
        )}
      </Header>
      {items.length > 0 && (
        <PaymentCardList>
          <Carousel
            deviceType={deviceType}
            autoPlay={false}
            infinite={false}
            data={items}
            responsive={responsive}
            component={(item: any) => (
              <PaymentCard
                key={item._id}
                onChange={() => handleChange(item)}
                onDelete={() => onDelete(item)}
                useOtherCard={useOtherCard}
                {...item}
              />
            )}
          />
        </PaymentCardList>
      )}

      {items.mobileWallet === true || items.cashOnDelivery === true ? (
        <OtherPayOption>
          {/* Mobile Wallet */}
          {items.mobileWallet === true ? (
            <label
              htmlFor="mobile-wallet"
              key="${name}-mobile-wa"
              className="other-pay-radio"
            >
              <input
                type="radio"
                id="mobile-wallet"
                name={name}
                value="mobile-wallet"
                onChange={handleChange}
              />
              <span>Mobile Wallet</span>
            </label>
          ) : (
            ''
          )}

          {/* Cash On Delivery */}
          {items.cashOnDelivery === true ? (
            <label
              htmlFor="cash-on-delivery"
              key="${name}-cash"
              className="other-pay-radio cash-on-delivery"
            >
              <input
                type="radio"
                id="cash-on-delivery"
                name={name}
                value="cash-on-delivery"
                onChange={handleChange}
              />
              <span>Cash On Delivery</span>
            </label>
          ) : (
            ''
          )}
        </OtherPayOption>
      ) : (
        ''
      )}
    </>
  );
};

export default PaymentGroup;
