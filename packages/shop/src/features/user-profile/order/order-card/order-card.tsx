import React from 'react';
import {
  SingleOrderList,
  OrderListHeader,
  TrackID,
  Status,
  OrderMeta,
  Meta,
} from './order-card.style';
import { convertUnixTime } from '../../../../../../share/time.helper';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { CURRENCY } from 'config/constant';

type OrderCardProps = {
  orderId?: any;
  onClick?: (e: any) => void;
  className?: any;
  status?: any;
  date?: number;
  amount?: number;
};

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  onClick,
  className,
  status,
  date,
  amount,
}) => {
  return (
    <SingleOrderList onClick={onClick} className={className}>
      <OrderListHeader>
        <TrackID>
          <FormattedMessage
            id="intlOrderCardTitleText"
            defaultMessage="Order"
          />
          <span>&nbsp;{orderId}</span>
        </TrackID>
        <Status>{status}</Status>
      </OrderListHeader>

      <OrderMeta>
        <Meta>
          <FormattedMessage
            id="intlOrderCardDateText"
            defaultMessage="Order Date"
          />
          : <span>{convertUnixTime(date)}</span>
        </Meta>
        <Meta className="price">
          <FormattedMessage
            id="intlOrderCardTotalText"
            defaultMessage="Total Price"
          />
          :
          <span>
            {CURRENCY} <FormattedNumber value={amount} />
          </span>
        </Meta>
      </OrderMeta>
    </SingleOrderList>
  );
};

export default OrderCard;
