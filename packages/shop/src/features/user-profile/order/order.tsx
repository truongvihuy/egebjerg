import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  DesktopView,
  MobileView,
  OrderBox,
  OrderListWrapper,
  StyledOrderContainer,
  OrderDetailsWrapper,
  Title,
  ImageWrapper,
  ItemWrapper,
  ItemDetails,
  ItemName,
  ItemSize,
  ItemPrice,
  NoOrderFound,
  StyledButtonText,
  StyledOfferBadge,
  StyledButtonWrapper,
} from './order.style';
import OrderDetails from './order-details/order-details';
import OrderDetailMobile from './order-details/order-detail-mobile';
import OrderCard from './order-card/order-card';
import OrderCardMobile from './order-card/order-card-mobile';
import useComponentSize from 'utils/useComponentSize';
import Link from 'next/link';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { CURRENCY } from 'config/constant';
import { Button } from 'components/button/button';
import { ORDER_STATUS_CONFIG } from '../../../../../share/constant';
import { GET_ORDERS } from 'graphql/query/order.query';
import { initializeApollo } from 'utils/apollo';
import { GET_PRODUCTS } from 'graphql/query/product.query';
import { useCart } from 'contexts/cart/use-cart';
import { cartAnimation } from 'utils/cart-animation';
import { CartIcon } from 'assets/icons/CartIcon';
import { useRouter } from 'next/router';
import { onClickComboOfferBadge } from 'components/offer-badge/offer-badge';
import { Information as InformationIcon } from 'assets/icons/Information';
import { OrderCardLoader, OrderDetailLoader } from 'features/user-profile/order/order.loader';
import { CustomerContext } from 'contexts/customer/customer.context';
import { cloneDeep } from 'lodash';
import { getImageSrc } from 'utils/general-helper';

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
        <div className='loader'><OrderDetailLoader column='items' /></div>
        <ItemWrapper>
          <ImageWrapper>
            <img className="product-image" src={getImageSrc(record.image)} alt={record.name} />
          </ImageWrapper>

          <ItemDetails>
            <ItemName><Link href={'/product/[slug]'} as={`/product/${record._id}-${record.info?.slug ?? ''}`}>{record.name}</Link></ItemName>
            <ItemSize>{record.weight}</ItemSize>
            <ItemPrice>{CURRENCY} <FormattedNumber value={record.price} /></ItemPrice>
            {
              // This item is now on sale
              record.info?.offer && (
                <StyledOfferBadge className='has-svg-icon can-click' onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickComboOfferBadge(record.info?.offer)
                }}><span>Denne vare er nu på tilbud</span><InformationIcon color='#eda32f'></InformationIcon></StyledOfferBadge>
              )
            }
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
        <div className='loader'><OrderDetailLoader column='quantity' /></div>
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
      <>
        <div className='loader'><OrderDetailLoader column='price' /></div>
        <p>{CURRENCY} <FormattedNumber value={record.total} /> </p>
      </>
    ),
  },
  {
    title: null,
    dataIndex: '',
    key: 'button',
    className: 'button',
    align: 'center',
    width: 80,
    render: (text, record) => (
      <>
        <div className='loader'><OrderDetailLoader column='button' /></div>
        <Button className='button-cart' disabled={!record.info} onClick={record.onClick}>
          <CartIcon />
          <StyledButtonText><FormattedMessage id='addToCartButton' defaultMessage='Add' /></StyledButtonText>
        </Button>
      </>
    )
  }
];

type Props = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  order_id?: number;
  fetchLimit?: number
};

const OrdersContent: React.FC<Props> = ({ deviceType, order_id = null, fetchLimit = 3 }) => {
  const { customerState } = useContext<any>(CustomerContext);
  const { addItem, addItemList } = useCart();
  const addItemRef = useRef(addItem);
  addItemRef.current = addItem;
  const [activeOrder, setActiveOrder] = useState(null);
  const router = useRouter();

  const [targetRef, size] = useComponentSize();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleLoadData = (query: any = {}) => {
    setLoading(true);
    const apolloClient = initializeApollo();
    apolloClient.query({
      query: GET_ORDERS,
      variables: {
        limit: fetchLimit,
        offset: 0,
        ...query,
      }
    }).then((response) => {
      setLoading(response.loading);
      setData(response.data);
    });
  }
  if (!loading && !data) handleLoadData({ order_id });

  const handleClick = (order: any, enabledPushRouter: boolean) => {
    let selectedOrder = { ...order };
    const apolloClient = initializeApollo();
    const idList = order.product_list.map(e => e._id).filter(id => id);
    apolloClient.query({
      query: GET_PRODUCTS,
      variables: {
        product_id: idList,
        limit: idList.length,
      },
    }).then((response) => {
      selectedOrder = cloneDeep(selectedOrder);
      selectedOrder.loading = false;
      selectedOrder.product_list = order.product_list.map(e => {
        let item = response.data.products.items.find(item => e._id === item._id);
        return {
          ...e,
          info: item,
          onClick: item ? (e) => addOneProductToCart(e, item) : null
        }
      });
      setActiveOrder(selectedOrder);
    }).catch((e) => {
      selectedOrder = cloneDeep(selectedOrder);
      selectedOrder.loading = false;
      setActiveOrder(selectedOrder);
    });
    selectedOrder.loading = true;
    if (enabledPushRouter) {
      router.push('/order/[slug]', `/order/${selectedOrder._id}`);
    }
    setActiveOrder(selectedOrder);
  };

  useEffect(() => {
    if (!activeOrder && data && data.orders) {
      if (data.orders.items.length !== 0) {
        let order = order_id ? data.orders.items.find(e => e._id === order_id) : data.orders.items[0];
        if (order) {
          handleClick(order, false);
        } else {
          router.push('/order', `/order`);
          handleLoadData({ order_id: null });
        }
      } else {
        if (order_id) {
          router.push('/order', `/order`);
          handleLoadData({ order_id: null });
        }
      }
    }
  }, [data && data.orders, order_id]);

  const addOneProductToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addItemRef.current(item);
    cartAnimation(e);
  }

  const addAllProductsToCart = (typeView) => {
    const btnTags = document.querySelectorAll(`.${typeView} .button-cart`);
    for (let i = 0; i < btnTags.length; i++) {
      let btn = btnTags.item(i);
      if (btn.getAttribute('disabled') === null)
        cartAnimation({ target: btn });
    }
    let productList = [];
    activeOrder.product_list.forEach(item => {
      if (item.info) {
        productList.push({ ...item.info, quantity: item.quantity });
      }
    });
    addItemList(productList);
  }

  const firstOrderOnList = data?.orders.items[0] ?? null,
    lastOrderOnList = data?.orders.items[data.orders.items.length - 1] ?? null;
  const ButtonGroupPage = ({ disabled = false }) => (
    <StyledButtonWrapper>
      <Button variant='outlined'
        disabled={disabled || firstOrderOnList.position >= data.orders.total}
        onClick={() => handleLoadData({
          position: firstOrderOnList.position + fetchLimit
        })}
      >{'< Tidligere'}</Button>
      <Button variant='outlined'
        disabled={disabled || lastOrderOnList.position <= 1}
        onClick={() => handleLoadData({
          position: lastOrderOnList.position - 1
        })}
      > {'Næste >'} </Button>
    </StyledButtonWrapper>
  )
  return (
    <OrderBox>
      {deviceType.desktop ? (
        <DesktopView>
          <OrderListWrapper style={{ height: 'fit-content' }}>
            <Title style={{ padding: '0 20px' }}>
              <FormattedMessage
                id='intlOrderPageTitle'
                defaultMessage='My Order'
              />
            </Title>
            <StyledOrderContainer style={{ minHeight: '530px' }}>
              {loading ? (
                <>
                  <OrderCardLoader uniqueKey="order-1" />
                  <OrderCardLoader uniqueKey="order-2" />
                  <OrderCardLoader uniqueKey="order-3" />
                </>
              ) :
                (data && data.orders && data.orders.items.length !== 0 ? (
                  <>
                    {data.orders.items.map((current: any) => (
                      <OrderCard
                        key={current._id}
                        orderId={current._id}
                        className={current._id === activeOrder?._id ? 'active' : ''}
                        status={ORDER_STATUS_CONFIG[current.status]?.name}
                        date={current.created_date}
                        amount={current.amount}
                        onClick={() => {
                          handleClick(current, true);
                        }}
                      />
                    ))}
                  </>
                ) : (
                  <NoOrderFound>
                    <FormattedMessage
                      id='intlNoOrderFound'
                      defaultMessage='No order found'
                    />
                  </NoOrderFound>
                ))}
            </StyledOrderContainer>
            <StyledOrderContainer style={{ paddingTop: '20px' }}>
              {data && data.orders && data.orders.items.length !== 0 && <ButtonGroupPage disabled={loading} />}
            </StyledOrderContainer>
          </OrderListWrapper>

          <OrderDetailsWrapper ref={targetRef}>
            <Title style={{ padding: '0 20px' }}>
              <FormattedMessage
                id='orderDetailsText'
                defaultMessage='Order Details'
              />
            </Title>
            {activeOrder && activeOrder._id && (
              <OrderDetails
                progressStatus={activeOrder.status}
                address={activeOrder.address_info}
                subtotal={activeOrder.subtotal}
                discount={activeOrder.discount}
                delivery_fee={activeOrder.delivery_fee}
                overweight_fee={activeOrder.overweight_fee}
                total_weight={activeOrder.total_weight}
                // vat_fee={activeOrder.vat_fee}
                grandTotal={activeOrder.amount}
                tableData={activeOrder.product_list}
                columns={orderTableColumns}
                loading={activeOrder.loading}
                addAllProductsToCart={addAllProductsToCart}
              />
            )}
          </OrderDetailsWrapper>
        </DesktopView>
      ) : (
        <MobileView>
          <StyledOrderContainer>
            {order_id === null || !activeOrder
              ? data?.orders.items.length ? <>
                <OrderCardMobile
                  orders={data.orders.items}
                  columns={orderTableColumns}
                  viewOrderDetail={handleClick}
                />
                <ButtonGroupPage />
              </> : null
              : <OrderDetailMobile order={activeOrder} columns={orderTableColumns}
                addAllProductsToCart={addAllProductsToCart} />}
          </StyledOrderContainer>
        </MobileView>
      )}

    </OrderBox >
  );
};

export default OrdersContent;
