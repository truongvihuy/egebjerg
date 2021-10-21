import React from 'react';
import MasterCard from './image/master-card.png';
import Paypal from './image/paypal.png';
import Visa from './image/visa.png';
import Dankort from './image/dankort.png';
import {
  PaymentCardWrapper,
  CardLogo,
  CardDetail,
  CardNumTitle,
  Name,
} from './payment-card.style';

interface Props {
  id: string;
  name: string;
  cardType: string;
  lastFourDigit: string;
  color: string;
}

const Card: React.FC<Props> = ({
  id,
  name,
  cardType,
  lastFourDigit,
  color,
}) => {
  const logo = (cardType === 'visa') ? Visa : Dankort;
  // (cardType === 'paypal' && Paypal) ||
  // (cardType === 'master' && MasterCard) ||

  return (
    <PaymentCardWrapper className="payment-card" color={color}>
      <CardLogo>
        <img src={logo} alt={`card-${id}`} />
      </CardLogo>
      <CardNumTitle>
        <div>Kortnummer</div>
        <div>Expiry Date</div>
        <div>CVV2/CVC3</div>
      </CardNumTitle>
      <CardDetail>
        <div>**** **** **** {lastFourDigit}</div>
        <div>12/21</div>
        <div>***</div>
      </CardDetail>
      <Name>{name}</Name>
    </PaymentCardWrapper>
  );
};

export default Card;
