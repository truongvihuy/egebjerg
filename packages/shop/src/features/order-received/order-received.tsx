import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OrderReceivedWrapper, {
  OrderReceivedContainer,
  OrderInfo,
  OrderDetails,
  StyledBlockAddress,
  BlockTitle,
  Text,
  InfoBlockWrapper,
  InfoBlock,
} from './order-received.style';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useCart } from 'contexts/cart/use-cart';
import { CURRENCY } from 'config/constant';
import { CustomerContext } from 'contexts/customer/customer.context';
import { convertUnixTime } from '../../../../share/time.helper';
import { GET_ORDERS } from 'graphql/query/order.query';
import { initializeApollo } from 'utils/apollo';

type OrderReceivedProps = {};

const OrderReceived: React.FunctionComponent<OrderReceivedProps> = (props) => {
  const router = useRouter();
  const { query } = router;
  const {
    orderReceived,
    pushOrderReceived
  } = useCart();
  const { customerState } = useContext<any>(CustomerContext);

  if (!customerState.accessTokenInfo?.affectedCustomerId) {
    return null;
  }
  if (!orderReceived) {
    if (typeof window !== 'undefined') {
      if (query.id) {
        const apolloClient = initializeApollo();
        apolloClient.query({
          query: GET_ORDERS,
          variables: {
            order_id: +query.id,
            limit: 1,
            offset: 0,
          }
        }).then((response) => {
          if (response.data.orders.items.length > 0) {
            pushOrderReceived(response.data.orders.items[0]);
          } else {
            router.push({
              pathname: '/order'
            });
          }
        });
      } else {
        router.push({
          pathname: '/order'
        });
      }
    }
  }

  if (!orderReceived) {
    return null;
  }
  return (
    <OrderReceivedWrapper>
      <OrderReceivedContainer>
        <Link href="/">
          <a className="home-btn">
            <FormattedMessage id="backHomeBtn" defaultMessage="Back to Home" />
          </a>
        </Link>

        <OrderInfo>
          <BlockTitle>
            <FormattedMessage
              id="orderReceivedText"
              defaultMessage="Order Received"
            />
          </BlockTitle>
          {query.confirm == '0' ?
            (<Text>
              <FormattedMessage
                id="orderCanceledSuccess"
                defaultMessage="Order has been cancelled"
              />
            </Text>) :
            (<Text>
              <FormattedMessage
                id="orderReceivedSuccess"
                defaultMessage="Thank you. Your order has been received"
              />
            </Text>
            )}

          {query.confirm !== '0' && <InfoBlockWrapper>
            <InfoBlock>
              <Text bold className="title">
                <FormattedMessage
                  id="orderNumberText"
                  defaultMessage="Order Number"
                />
              </Text>
              <Text>{orderReceived._id}</Text>
            </InfoBlock>

            <InfoBlock>
              <Text bold className="title">
                <FormattedMessage id="orderDateText" defaultMessage="Date" />
              </Text>
              <Text>{convertUnixTime(orderReceived.created_date)}</Text>
            </InfoBlock>

            <InfoBlock>
              <Text bold className="title">
                <FormattedMessage id="totalText" defaultMessage="Total" />
              </Text>
              <Text>{CURRENCY} <FormattedNumber value={orderReceived.amount} /></Text>
            </InfoBlock>

            {/* <InfoBlock>
              <Text bold className="title">
                <FormattedMessage
                  id="paymenMethodText"
                  defaultMessage="Payment Method"
                />
              </Text>
              <Text>
                <FormattedMessage
                  id="paymentMethodName"
                  defaultMessage="Cash on delivery"
                />
              </Text>
            </InfoBlock> */}
          </InfoBlockWrapper>}
        </OrderInfo>

        {query.confirm !== '0' && <OrderDetails>
          <BlockTitle>
            <FormattedMessage
              id="orderDetailsText"
              defaultMessage="Order Details"
            />
          </BlockTitle>

          <StyledBlockAddress>
            <Text>{customerState.name}</Text>
            <Text>{orderReceived.address_info.address}</Text>
            <Text>{orderReceived.address_info.zip_code} {orderReceived.address_info.city}</Text>
          </StyledBlockAddress>
        </OrderDetails>}
      </OrderReceivedContainer>
    </OrderReceivedWrapper>
  );
};

export default OrderReceived;
