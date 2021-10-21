import React, { useContext } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { CURRENCY, WEIGHT } from 'config/constant';
import {
  OrderDetail,
  DeliveryInfo,
  DeliveryAddress,
  StyledAddressInfo,
  CostCalculation,
  PriceRow,
  Price,
  OrderTableMobile,
} from '../order-card/order-card.style';
import {
  ItemBox,
  Image,
  Information,
  StyledName,
  Price as StyledPrice,
  Weight,
  Total,
} from 'components/cart-item/cart-item.style';
import { Button } from 'components/button/button';
import { ItemWrapper } from 'features/carts/cart.style';
import { CartIcon } from 'assets/icons/CartIcon';
import { StyledButtonWrapper } from './order-details.style';
import { CustomerContext } from 'contexts/customer/customer.context';
import { getImageSrc } from 'utils/general-helper';

type MobileOrderDetailProps = {
  order: any;
  columns: any;
  addAllProductsToCart?: (e: any) => void;
  hideBtnCart?: boolean;
};

const TableMobile = ({ data, className, hideBtnCart = true }) => (
  <ItemWrapper className={className} style={{ padding: '0px' }}>
    {data.map((item, index) => (
      <ItemBox key={index} className='product-card' style={{ paddingLeft: '0px', paddingRight: '15px' }}>
        <div style={{ width: '100%' }}>
          <StyledName>{item.name}</StyledName>
          <div style={{ display: 'flex' }}>
            <Image src={getImageSrc(item.image)} className="product-image" />
            <Information>
              <StyledPrice>
                {CURRENCY} <FormattedNumber value={item.price} />
              </StyledPrice>
              <Weight>
                {item.quantity} x {item.weight}
              </Weight>
            </Information>
            <Total>
              <div>{CURRENCY} <FormattedNumber value={item.total + (item.discount ?? 0)} /></div>
            </Total>
            {hideBtnCart && <Button className='button-cart' disabled={!item.info} onClick={item.onClick}>
              <CartIcon />
            </Button>}
          </div>
        </div>
      </ItemBox>
    ))}
  </ItemWrapper>
)

const OrderDetailMobile: React.FC<MobileOrderDetailProps> = ({
  order,
  columns,
  addAllProductsToCart,
  hideBtnCart = true,
}) => {
  const {
    customerState: { name },
  } = useContext<any>(CustomerContext);
  return (
    <OrderDetail>
      <DeliveryInfo>
        <DeliveryAddress>
          <h3>Delivery Address</h3>
          <StyledAddressInfo>{name}</StyledAddressInfo>
          <StyledAddressInfo>{order.address_info.address}</StyledAddressInfo>
          <StyledAddressInfo>{order.address_info.zip_code} {order.address_info.city}</StyledAddressInfo>
        </DeliveryAddress>

        <CostCalculation>
          <PriceRow>
            <FormattedMessage id="subTotal" defaultMessage="Sub total" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.subtotal} />
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsDiscount" defaultMessage="Discount" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.discount} />
            </Price>
          </PriceRow>
          {/* <PriceRow >
            <FormattedMessage id="intlOrderDetailsVat" defaultMessage="VAT" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.vat_fee} />
            </Price>
          </PriceRow> */}
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsDelivery" defaultMessage="Delivery Fee" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.delivery_fee} />
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsTotalWeight" defaultMessage="Total Weight" />
            <Price>
              <FormattedNumber value={order.total_weight} /> {WEIGHT}
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsOverWeightFee" defaultMessage="Overweight fee" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.overweight_fee} />
            </Price>
          </PriceRow>
          <PriceRow className="grandTotal">
            <FormattedMessage id="totalText" defaultMessage="Total" />
            <Price>
              {CURRENCY} <FormattedNumber value={order.amount} />
            </Price>
          </PriceRow>
        </CostCalculation>
      </DeliveryInfo>

      {order &&
        <OrderTableMobile columns={columns}>
          <TableMobile hideBtnCart={hideBtnCart}
            className='product-list-mobile'
            data={order.product_list} />
          {hideBtnCart && <StyledButtonWrapper>
            {/* {active?.status == ORDER_STATUS.received ? <StyledBtnCancel><FormattedMessage id="cancelBtn" defaultMessage="Cancel" /></StyledBtnCancel> : null} */}
            <Button onClick={() => addAllProductsToCart('product-list-mobile')}>
              <FormattedMessage id="orderFromPreviousOrdersBtn" defaultMessage="Order from previous orders" />
            </Button>
          </StyledButtonWrapper>}
        </OrderTableMobile>}
    </OrderDetail>
  );
}
export default OrderDetailMobile;