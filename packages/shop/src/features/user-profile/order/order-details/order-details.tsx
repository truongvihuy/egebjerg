import React, { useContext } from 'react';
import Table from 'rc-table';
import {
  DeliveryInfo,
  DeliveryAddress,
  StyledAddressInfo,
  CostCalculation,
  PriceRow,
  Price,
  OrderTableWrapper,
  OrderTable,
  StyledButtonWrapper
} from './order-details.style';
import { CURRENCY, WEIGHT } from 'config/constant';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Button } from 'components/button/button';
import { CustomerContext } from 'contexts/customer/customer.context';

type OrderDetailsProps = {
  tableData?: any;
  columns?: any;
  progressStatus?: any;
  address?: any;
  subtotal?: number;
  discount?: number;
  delivery_fee?: number;
  overweight_fee: number;
  total_weight: number;
  // vat_fee: number;
  grandTotal?: number;
  loading?: boolean;
  addAllProductsToCart?: (viewType: any) => void;
};

const components = {
  table: OrderTable,
};

const OrderDetails: React.FC<OrderDetailsProps> = ({
  tableData,
  columns,
  address,
  progressStatus,
  subtotal,
  discount,
  delivery_fee,
  overweight_fee,
  total_weight,
  // vat_fee,
  grandTotal,
  loading,
  addAllProductsToCart,
}) => {
  const {
    customerState: { name },
  } = useContext<any>(CustomerContext);
  return (
    <>
      <DeliveryInfo>
        <DeliveryAddress>
          <h3>
            <FormattedMessage
              id="deliveryAddressTitle"
              defaultMessage="Delivery Address"
            />
          </h3>
          <StyledAddressInfo>{name}</StyledAddressInfo>
          <StyledAddressInfo>{address.address}</StyledAddressInfo>
          <StyledAddressInfo>{address.zip_code} {address.city}</StyledAddressInfo>
        </DeliveryAddress>

        <CostCalculation>
          <PriceRow>
            <FormattedMessage id="subTotal" defaultMessage="Subtotal" />
            <Price>
              {CURRENCY} <FormattedNumber value={subtotal} />
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsDiscount" defaultMessage="Discount" />
            <Price>
              {CURRENCY} <FormattedNumber value={-discount} />
            </Price>
          </PriceRow>
          {/* <PriceRow >
            <FormattedMessage id="intlOrderDetailsVat" defaultMessage="VAT" />
            <Price>
              {CURRENCY} <FormattedNumber value={vat_fee} />
            </Price>
          </PriceRow> */}
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsDelivery" defaultMessage="Delivery Fee" />
            <Price>
              {CURRENCY} <FormattedNumber value={delivery_fee} />
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsTotalWeight" defaultMessage="Total Weight" />
            <Price>
              <FormattedNumber value={total_weight} /> {WEIGHT}
            </Price>
          </PriceRow>
          <PriceRow>
            <FormattedMessage id="intlOrderDetailsOverWeightFee" defaultMessage="Overweight fee" />
            <Price>
              {CURRENCY} <FormattedNumber value={overweight_fee} />
            </Price>
          </PriceRow>
          <PriceRow className="grandTotal">
            <FormattedMessage id="totalText" defaultMessage="Total" />
            <Price>
              {CURRENCY} <FormattedNumber value={grandTotal} />
            </Price>
          </PriceRow>
        </CostCalculation>
      </DeliveryInfo>

      <OrderTableWrapper>
        <Table
          columns={columns}
          rowClassName='product-card'
          data={tableData}
          rowKey={(record, index) => index}
          components={components}
          className={`orderDetailsTable product-list-desktop ${loading ? 'loading' : ''}`}
        // scroll={{ y: 350 }}
        />
        {addAllProductsToCart && <StyledButtonWrapper>
          {/* {order?.progressStatus == ORDER_STATUS.received ? <StyledBtnCancel><FormattedMessage id="cancelBtn" defaultMessage="Cancel" /></StyledBtnCancel> : null} */}
          <Button disabled={loading} onClick={() => addAllProductsToCart('product-list-desktop')}>
            <FormattedMessage id="orderFromPreviousOrdersBtn" defaultMessage="Order from previous orders" />
          </Button>
        </StyledButtonWrapper>}
      </OrderTableWrapper>
    </>
  );
};

export default OrderDetails;
