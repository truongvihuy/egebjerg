import React from 'react';
import { Counter } from 'components/counter/counter';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { CURRENCY } from 'config/constant';
import {
  ItemBox,
  Image,
  Information,
  StyledName,
  Price,
  Weight,
  Total,
  StyledRemoveButton,
} from './cart-item.style';

interface Props {
  data: any;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}

export const TextCartItem: React.FC<Props> = ({
  data,
  onDecrement,
  onIncrement,
  onRemove,
}) => {
  const { name, price, salePrice, unit, quantity } = data;
  const displayPrice = salePrice ? salePrice : price;
  // const totalPrice = quantity * displayPrice;
  return (
    <ItemBox>
      <Counter
        value={quantity}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        variant="lightVertical"
      />
      {/* <Image src={image} /> */}
      <Information>
        <StyledName>{name}</StyledName>
      </Information>
      <Total>
        {CURRENCY}
        {(quantity * displayPrice).toFixed(2)}
      </Total>
      <StyledRemoveButton onClick={onRemove}>
        <CloseIcon />
      </StyledRemoveButton>
    </ItemBox>
  );
};
