import React from 'react';
import Card from './card';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { DeleteButton, Wrapper } from './payment-card.style';

interface PaymentCardProps {
  className?: string;
  logo: string;
  alt: string;
  cardNumber: string;
  name: string;
  color?: string;
  useOtherCard: boolean;
}

const PaymentCard: React.FunctionComponent<any> = ({
  className,
  onChange,
  onDelete,
  name,
  _id,
  cardType,
  lastFourDigit,
  type,
  color,
  useOtherCard = false,
}) => {
  function handleChange() {
    onChange();
  }
  function handleDelete() {
    onDelete();
  }
  return (
    <Wrapper
      htmlFor={`payment-card-${_id}`}
      className={`payment-card-radio ${className ? className : ''}`}
    >
      <input
        type='radio'
        id={`payment-card-${_id}`}
        name={name}
        value={`payment-card-${_id}`}
        // onChange={handleChange}
        // onClick={handleChange}
        checked={type === 'primary' && !useOtherCard}
      />

      <Card
        id={`card-${_id}`}
        cardType={cardType}
        lastFourDigit={lastFourDigit}
        color={useOtherCard ? '#FFFFFF' : color}
        name={name}
      />

      <DeleteButton
        // type="submit"
        onClick={handleDelete}
        className='card-remove-btn'
      >
        <CloseIcon />
      </DeleteButton>
    </Wrapper>
  );
};

export default PaymentCard;
