import React from 'react';
import {
  CartPopupButtonStyled,
  ButtonImgBox,
  ItemCount,
  PriceBox,
  CartPopupBoxButton,
  PriceBoxAlt,
  TotalItems,
} from './cart-popup.style';
import { ShoppingBag } from 'assets/icons/ShoppingBag';
import { CURRENCY } from 'config/constant';
import { FormattedNumber } from 'react-intl';

type CartButtonProps = {
  style?: React.CSSProperties;
  itemCount?: number;
  itemPostfix?: any;
  price?: number;
  pricePrefix?: string;
  className?: string;
  onClick?: (e: any) => void;
};

const CartPopupButton: React.FC<CartButtonProps> = ({
  itemCount,
  itemPostfix = 'items',
  price,
  pricePrefix = CURRENCY,
  style,
  onClick,
  className,
}) => (
  <CartPopupButtonStyled style={style} onClick={onClick} className={className}>
    <ButtonImgBox>
      <ShoppingBag />
    </ButtonImgBox>
    <ItemCount>
      {itemCount} {itemPostfix}
    </ItemCount>
    <PriceBox>
      {pricePrefix} <FormattedNumber value={price} />
    </PriceBox>
  </CartPopupButtonStyled>
);

export const BoxedCartButton: React.FC<CartButtonProps> = ({
  itemCount,
  itemPostfix = 'items',
  price,
  pricePrefix = CURRENCY,
  style,
  onClick,
  className,
}) => (
  <CartPopupBoxButton style={style} onClick={onClick} className={className}>
    <TotalItems>
      <ShoppingBag />
      {itemCount} {itemPostfix}
    </TotalItems>
    <PriceBoxAlt>
      {CURRENCY} {price >= 0 ? <FormattedNumber value={price} currency={CURRENCY} /> : '---'}
    </PriceBoxAlt>
  </CartPopupBoxButton>
);

export default CartPopupButton;
