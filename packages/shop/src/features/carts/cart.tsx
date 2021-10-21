import React, { useContext, useState } from 'react';
import Link from 'next/link';
import {
  CartPopupBody,
  PopupHeader,
  PopupItemCount,
  CloseButton,
  PromoCode,
  CheckoutButtonWrapper,
  CheckoutButton,
  Title,
  PriceBox,
  NoProductMsg,
  NoProductImg,
  ItemWrapper,
  CouponBoxWrapper,
  CouponCode,
} from './cart.style';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { ShoppingBagLarge } from 'assets/icons/ShoppingBagLarge';
import { NoCartBag } from 'assets/icons/NoCartBag';
import { CURRENCY } from 'config/constant';
import { FormattedMessage } from 'react-intl';
import { FormattedNumber } from 'react-intl';
import { useLocale } from 'contexts/language/language.provider';

import { Scrollbar } from 'components/scrollbar/scrollbar';
import { useCart } from 'contexts/cart/use-cart';
import { CartItem } from 'components/cart-item/cart-item';
import { CustomerContext } from 'contexts/customer/customer.context';
import { processOrderItemList } from '../../../../share/order.helper';

type CartPropsType = {
  style?: any;
  className?: string;
  scrollbarHeight?: string;
  onCloseBtnClick?: (e: any) => void;
};

const Cart: React.FC<CartPropsType> = ({
  style,
  className,
  onCloseBtnClick,
  scrollbarHeight,
}) => {
  const {
    items,
    addItem,
    removeItem,
    cartItemsCount,
    changeWeightOption,
    noteItem,
  } = useCart();
  const { customerState } = useContext<any>(CustomerContext);
  const { product_list, total } = processOrderItemList(items, customerState);

  const CheckOutButtonEle = (
    <CheckoutButton>
      <Title>
        <FormattedMessage id='nav.checkout' defaultMessage='Checkout' />
      </Title>
      <PriceBox>
        {CURRENCY} <FormattedNumber value={total} currency={CURRENCY} />
      </PriceBox>
    </CheckoutButton>
  );

  return (
    <CartPopupBody className={className} style={style}>
      <PopupHeader>
        <PopupItemCount>
          <ShoppingBagLarge width='19px' height='24px' />
          <span>
            {cartItemsCount}
            &nbsp;
            {cartItemsCount > 1 ? (
              <FormattedMessage id='cartItems' defaultMessage='items' />
            ) : (
              <FormattedMessage id='cartItem' defaultMessage='item' />
            )}
          </span>
        </PopupItemCount>

        <CloseButton onClick={onCloseBtnClick}>
          <CloseIcon />
        </CloseButton>
      </PopupHeader>

      <Scrollbar className='cart-scrollbar'>
        <ItemWrapper className='items-wrapper'>
          {!!cartItemsCount ? (
            product_list.map((item, idx) => (
              <CartItem
                key={`cartItem-${item._id}-${idx}`}
                onIncrement={() => addItem(item)}
                onDecrement={() => removeItem(item)}
                onRemove={() => removeItem(item, item.quantity)}
                handleWriteNote={(e) => noteItem(item, e.target.value)}
                changeWeightOption={changeWeightOption}
                data={item}
              />
            ))
          ) : (
            <>
              <NoProductImg>
                <NoCartBag />
              </NoProductImg>
              <NoProductMsg>
                <FormattedMessage
                  id='noProductFound'
                  defaultMessage='No products found'
                />
              </NoProductMsg>
            </>
          )}
        </ItemWrapper>
      </Scrollbar>

      <CheckoutButtonWrapper>
        {/* <PromoCode>
          {!coupon?.discountInPercent ? (
            <>
              {!hasCoupon ? (
                <button onClick={() => setCoupon((prev) => !prev)}>
                  <FormattedMessage
                    id='specialCode'
                    defaultMessage='Have a special code?'
                  />
                </button>
              ) : (
                <CouponBoxWrapper>
                  <Coupon
                    disabled={!items.length}
                    style={{
                      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </CouponBoxWrapper>
              )}
            </>
          ) : (
            <CouponCode>
              <FormattedMessage
                id='couponApplied'
                defaultMessage='Coupon Applied'
              />
              <span>{coupon.code}</span>
            </CouponCode>
          )}
        </PromoCode> */}

        {cartItemsCount !== 0 ? (
          <Link href='/checkout'>
            {CheckOutButtonEle}
          </Link>
        ) : (
          <>{CheckOutButtonEle}</>
        )}
      </CheckoutButtonWrapper>
    </CartPopupBody>
  );
};

export default Cart;
