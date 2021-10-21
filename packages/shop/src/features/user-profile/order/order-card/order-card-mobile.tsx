import React from 'react';

import {
  OrderListHeader,
  TrackID,
  Status,
  OrderMeta,
  Meta,
  CardWrapper,
  OrderTable,
} from './order-card.style';

import { CURRENCY } from 'config/constant';
import { ORDER_STATUS_CONFIG } from '../../../../../../share/constant';
import { FormattedNumber } from 'react-intl';
import { convertUnixTime } from '../../../../../../share/time.helper';

type MobileOrderCardProps = {
  orderId?: any;
  viewOrderDetail?: (order: any, enablePushRouter: boolean) => void;
  className?: any;
  status?: any;
  date?: any;
  amount?: number;
  tableData?: any;
  columns?: any;
  progressStatus?: any;
  address?: string;
  subtotal?: number;
  discount?: number;
  delivery_fee?: number;
  grandTotal?: number;
  orders?: any;
};

const components = {
  table: OrderTable,
};

const OrderCard: React.FC<MobileOrderCardProps> = ({
  viewOrderDetail,
  className,
  columns,
  orders,
}) => {
  //   const displayDetail = className === 'active' ? '100%' : '0';
  const addAllClasses: string[] = ['accordion'];

  if (className) {
    addAllClasses.push(className);
  }
  return (
    <>
      {orders.map((order: any) => (
        <CardWrapper key={order._id} onClick={() => viewOrderDetail(order, true)}>
          <OrderListHeader>
            <TrackID>
              Order <span>#{order._id}</span>
            </TrackID>
            <Status>{ORDER_STATUS_CONFIG[order.status]?.name}</Status>
          </OrderListHeader>

          <OrderMeta>
            <Meta>
              Order Date: <span>{convertUnixTime(order.created_date)}</span>
            </Meta>
            <Meta className="price">
              Total Price: <span>{CURRENCY} <FormattedNumber value={order.amount} /></span>
            </Meta>
          </OrderMeta>
        </CardWrapper>
      ))}
    </>
  );
};

export default OrderCard;
