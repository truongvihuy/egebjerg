import React from 'react';
import Link from 'next/link';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { CURRENCY } from 'config/constant';
import { convertUnixTime } from '../../../../share/time.helper';
import {
  DesktopView,
  OrderBox,
  OrderDetailsWrapper,
  Title,
  ItemWrapper,
  StyledOfferBadge,
  ItemName,
  ItemSize,
  ItemDetails, ItemPrice,
  ImageWrapper,
  StyledOrderContainer,
  MobileView,
} from 'features/user-profile/order/order.style';
import OrderDetails from 'features/user-profile/order/order-details/order-details';
import OrderDetailMobile from 'features/user-profile/order/order-details/order-detail-mobile';
import OrderCardMobile from 'features/user-profile/order/order-card/order-card-mobile';

import { StyledOrderDetailsWrapper } from './order-confirm.style';

const orderTableColumns = [
  {
    title: 'Varer',
    dataIndex: '',
    key: 'items',
    className: 'items',
    width: 250,
    ellipsis: true,
    render: (text, record) => (
      <>
        <ItemWrapper>
          <ImageWrapper>
            <img className="product-image" src={record.image} alt={record.name} />
          </ImageWrapper>

          <ItemDetails>
            <ItemName>{record.name}</ItemName>
            <ItemSize>{record.weight}</ItemSize>
            <ItemPrice>{CURRENCY} <FormattedNumber value={record.price} /></ItemPrice>
          </ItemDetails>
        </ItemWrapper>
      </>
    ),
  },
  {
    title: 'Antal',
    dataIndex: 'quantity',
    key: 'quantity',
    className: 'quantity',
    align: 'right',
    width: 100,
    render: (text, record) => (
      <>
        <div>{text}</div>
      </>
    ),
  },
  {
    title: 'Pris',
    dataIndex: '',
    key: 'price',
    className: 'price',
    align: 'right',
    width: 100,
    render: (text, record) => (
      <div style={{}}>
        {CURRENCY} <FormattedNumber value={record.total} />
      </div>
    ),
  },
];

const OrderConfirm = ({ order }) => {
  return (
    <OrderBox>
      <DesktopView>
        <StyledOrderDetailsWrapper>
          <Title style={{ padding: '0 20px' }}>
            <FormattedMessage
              id='orderDetailsText'
              defaultMessage='Order Details'
            />
          </Title>
          <OrderDetails
            progressStatus={order.status}
            address={order.address_info}
            subtotal={order.subtotal}
            discount={order.discount}
            delivery_fee={order.delivery_fee}
            overweight_fee={order.overweight_fee}
            total_weight={order.total_weight}
            // vat_fee={order.vat_fee}
            grandTotal={order.amount}
            tableData={order.products}
            columns={orderTableColumns}
            loading={order.loading}
          />
        </StyledOrderDetailsWrapper>
      </DesktopView>

      <MobileView>
        <StyledOrderContainer>
          <OrderDetailMobile order={order} hideBtnCart={false} columns={orderTableColumns} />
        </StyledOrderContainer>
      </MobileView>
    </OrderBox>
  );
};

export default OrderConfirm;