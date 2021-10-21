import React, { useContext, useState, useEffect } from 'react';
import Router from 'next/router';
import { Button } from 'components/button/button';
import { CURRENCY, PAYMENT_METHOD_NO_PAYMENT, PAYMENT_METHOD_CARD, WEIGHT } from 'config/constant';
import { FREE_NAME_PRODUCT_ID } from '../../../../share/constant';
import { Scrollbar } from 'components/scrollbar/scrollbar';
import CheckoutWrapper, {
  StyledCheckoutContainer, StyledCheckoutInformation,
  StyledInformationBox, StyledCheckoutSubmit,
  StyledTermConditionText, StyledTermConditionLink,
  StyledCartWrapper, StyledCalculationWrapper,
  StyledOrderInfo, StyledTitle,
  StyledItemsWrapper, StyledTextWrapper,
  StyledText, StyledBold,
  StyledSmall, StyledNoProductMsg,
  StyledNoProductImg, StyledMessageError,
  StyledTextError
} from './checkout.style';

import { NoCartBag } from 'assets/icons/NoCartBag';

import Sticky from 'react-stickynode';
import { CustomerContext } from 'contexts/customer/customer.context';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useCart } from 'contexts/cart/use-cart';
import { useWindowSize } from 'utils/useWindowSize';
import Address from 'features/address/address';
import Store from 'features/store/store';
import Contact from 'features/contact/contact';
import YesNoOptions from 'features/yes-no-options/yes-no-options'
import { CartItem } from 'components/cart-item/cart-item';
import { useMutation } from '@apollo/client';
import { ADD_ORDER } from 'graphql/mutation/order';
import Membership from 'features/membership/membership';
import ReplacementGoods from 'features/replacement-goods/replacement-goods';
import { processOrderItemList } from '../../../../share/order.helper';
import { isFreeNameProduct } from '../../../../share/general.helper';
import PaymentMethod from 'features/payment-method/payment-method';
import NoteOrder from 'features/note-order/note-order';
import { GET_SETTING } from 'graphql/query/setting.query';
import { initializeApollo } from 'utils/apollo';
import { useRouter } from 'next/router';
import { cloneDeep } from 'lodash';
// The type of props Checkout Form receives
interface MyFormProps {
  deviceType: any;
}
let extendItem: any = null;

const CheckoutWithSidebar: React.FC<MyFormProps> = ({ deviceType }) => {
  const router = useRouter();
  const { query } = router;
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);
  const { store } = customerState;
  const {
    items,
    note,
    cartItemsCount,
    addItem,
    removeItem,
    noteItem,
    pushOrderReceived,
    changeWeightOption,
    syncCart,
    order_id,
  } = useCart();

  const checkUseOtherCard = (paymentMethod, card) => {
    return paymentMethod == PAYMENT_METHOD_CARD && card && Array.isArray(card) && card.length === 0;
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(cartItemsCount > 0);
  const { _id, address, card, replacement_goods, payment_method, membership_number, isNormalAuthenticated, delivery_fee, zip_code, } = customerState;
  const size = useWindowSize();
  const [addOrderMutation] = useMutation(ADD_ORDER);
  const [settingMap, setSettingMap] = useState<any>(null);
  const [useOtherCard, setUseOtherCard] = useState(checkUseOtherCard(payment_method, card));
  const [saveCard, setSaveCard] = useState(false);
  const detailPrice = processOrderItemList(items, customerState, { payment_method });

  useEffect(() => {
    (async () => {
      const apolloClient = initializeApollo();
      const { data } = await apolloClient.query({
        query: GET_SETTING
      });
      let newSettingMap: any = {};
      data.settings.forEach(x => {
        let setting = { ...x };
        if (setting.value.startsWith('{') && setting.value.endsWith('}')) {
          setting.value = JSON.parse(setting.value);
        }
        newSettingMap[setting.key] = setting;
      });
      extendItem = {
        _id: FREE_NAME_PRODUCT_ID,
        quantity: 1,
        position: 0,
        name: newSettingMap["extra_payment_title"].value,
        price: +newSettingMap["extra_payment_amount"].value,
        total: +newSettingMap["extra_payment_amount"].value,
      };
      setSettingMap(newSettingMap);
      syncCart();
    })();
  }, []);
  useEffect(() => {
    setUseOtherCard(checkUseOtherCard(payment_method, card));
  }, [card, payment_method]);

  const hasReplacementComment = () => {
    let check = note != null && note != '';
    if (!check && customerState.replacement_goods) {
      for (const key in customerState.replacement_goods) {
        check = customerState.replacement_goods[key] === true;
      }
    }
    if (!check) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].cart.note != null && items[i].cart.note != '') {
          check = true;
          break;
        }
      }
    }
    return check;
  }

  const hasToAddExtra = () => {
    if (payment_method != 'Card') {
      return false;
    }
    let check = hasReplacementComment();
    // if (!check) {
    //   check = useOtherCard;
    // }
    return check;
  }

  const handleSubmit = () => {
    setLoading(true);
    if (isValid) {
      let productList = cloneDeep(items);
      let amount = detailPrice.amount;
      if (hasToAddExtra()) {
        productList.push({
          associated_list: null,
          cart: extendItem,
          product: extendItem
        });
        amount += extendItem.total;
      }
      const order: any = {
        product_list: productList.map(e => e.cart),
        replacement_goods,
        payment_method,
        membership_number,
        delivery_fee,
        note,
        card,
        amount,
        address_info: {
          address,
          zip_code: zip_code.zip_code,
          city: zip_code.city_name,
        },
      }
      if (useOtherCard) {
        order.use_other_card = useOtherCard;
      }
      if (saveCard) {
        order.save_card = saveCard;
      }
      addOrderMutation(
        {
          variables: { orderInput: JSON.stringify(order), }
        }
      ).then(response => {
        setLoading(false);
        const order = response.data.addOrder;
        pushOrderReceived(order);
        if (order.payment_url) {
          // window.open(order.payment_url, 'newwindow', 'height=600,width=1000');
          Router.push(order.payment_url);
        } else {
          Router.push('/order-received');
        }
      }).catch((err) => {
        syncCart();
        setLoading(false);
        setError(err);
      });
    }
  };

  useEffect(() => {
    if (
      cartItemsCount > 0
    ) {
      if (!isValid) {
        setIsValid(true);
      }
    } else {
      if (isValid) {
        setIsValid(false);
      }
    }
  }, [customerState, cartItemsCount]);

  return isNormalAuthenticated && settingMap && extendItem && (
    <form>
      <CheckoutWrapper>
        <StyledCheckoutContainer>
          <StyledCheckoutInformation>
            {/* DeliveryAddress */}
            {query.cancel_payment && <StyledTextError><FormattedMessage
              id="orderCanceledPayAgain"
              defaultMessage="Payment has been cancelled you can checkout again to payment"
            /></StyledTextError>}
            <StyledInformationBox>
              <Address
                increment={true}
                flexStart={true}
                buttonProps={{
                  variant: 'text',
                  type: 'button',
                  className: 'addButton',
                }}
                icon={true}
              />
            </StyledInformationBox>

            <StyledInformationBox>
              <Contact
                increment={true}
                flexStart={true}
                buttonProps={{
                  variant: 'text',
                  type: 'button',
                  className: 'addButton',
                }}
                icon={true}
              />
            </StyledInformationBox>

            <StyledInformationBox>
              <Store
                increment={true}
                flexStart={true}
                buttonProps={{
                  variant: 'text',
                  type: 'button',
                  className: 'addButton',
                }}
                icon={true}
              />
            </StyledInformationBox>

            <StyledInformationBox>
              <ReplacementGoods increment={true} />
            </StyledInformationBox>

            <StyledInformationBox>
              <NoteOrder increment={true} />
            </StyledInformationBox>

            <StyledInformationBox>
              <Membership increment={true} />
            </StyledInformationBox>

            {
              store.payment[0] !== PAYMENT_METHOD_NO_PAYMENT && <StyledInformationBox>
                <PaymentMethod addCard={false} increment={true} deviceType={deviceType} responsive={{
                  desktop: {
                    breakpoint: { max: 3000, min: 1024 },
                    items: 2,
                  },
                  tablet: {
                    breakpoint: { max: 1024, min: 464 },
                    items: 2,
                  },
                  mobile: {
                    breakpoint: { max: 464, min: 0 },
                    items: 1,
                  },
                }} useOtherCard={useOtherCard} />
                {checkUseOtherCard(payment_method, card) && settingMap && (hasToAddExtra() ? (
                  <>
                    <YesNoOptions style={{ marginLeft: '20px' }} titleId='replacement_comments_save_card' title={settingMap['replacement_comments_save_card'].value}
                      flag={saveCard} handleChangeOption={(value) => {
                        setSaveCard(value)
                      }}
                      switchSide='left'
                    />
                    <YesNoOptions style={{ marginLeft: '20px' }} titleId='replacement_comments_not_save_card' title={settingMap['replacement_comments_not_save_card'].value}
                      flag={!saveCard} handleChangeOption={(value) => {
                        setSaveCard(value ? false : true)
                      }}
                      switchSide='left'
                    />
                  </>
                ) : (
                  <>
                    <YesNoOptions style={{ marginLeft: '20px' }} titleId='save_card_text' title={settingMap['save_card_text'].value}
                      flag={saveCard} handleChangeOption={(value) => {
                        setSaveCard(value)
                      }}
                      switchSide='left'
                    />
                    <YesNoOptions style={{ marginLeft: '20px' }} titleId='no_replacement_no_comment_not_save_card' title={settingMap['no_replacement_no_comment_not_save_card'].value}
                      flag={!saveCard} handleChangeOption={(value) => {
                        setSaveCard(value ? false : true)
                      }}
                      switchSide='left'
                    />
                  </>
                ))}
              </StyledInformationBox>
            }

            <StyledInformationBox
              className='paymentBox'
              style={{ paddingBottom: 30 }}
            >
              <StyledTermConditionText>
                <FormattedMessage
                  id='termAndConditionHelper'
                  defaultMessage='By making this purchase you agree to our'
                />
                {/* <Link href='/terms' > */}
                <a href='/terms' target='_blank'>
                  <StyledTermConditionLink>
                    <FormattedMessage
                      id='termAndCondition'
                      defaultMessage='terms and conditions.'
                    />
                  </StyledTermConditionLink>
                </a>
                {/* </Link> */}
              </StyledTermConditionText>

              {error && <StyledMessageError>{error.message}</StyledMessageError>}
              {/* CheckoutSubmit */}
              <StyledCheckoutSubmit>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!isValid || detailPrice.error || loading}
                  size='big'
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  <FormattedMessage
                    id='processCheckout'
                    defaultMessage='Proceed to Checkout'
                  />
                </Button>
              </StyledCheckoutSubmit>
            </StyledInformationBox>
          </StyledCheckoutInformation>

          <StyledCartWrapper>
            <Sticky
              enabled={size.width >= 768 ? true : false}
              top={120}
              innerZ={999}
            >
              <StyledOrderInfo>
                <StyledTitle>
                  <FormattedMessage
                    id='cartTitle'
                    defaultMessage='Your Order'
                  />
                </StyledTitle>

                <Scrollbar className='checkout-scrollbar' options={{
                  scrollbars: {
                    visibility: 'auto',
                    autoHide: 'never',
                  },
                }}>
                  <StyledItemsWrapper>
                    {cartItemsCount > 0 ? (
                      detailPrice.product_list.map((item, idx) => (
                        <CartItem
                          key={`cartItem-${idx}`}
                          style={{ padding: '10px 5px' }}
                          onIncrement={(e: Event) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(item)
                          }}
                          onDecrement={(e: Event) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(item);
                          }}
                          onRemove={(e: Event) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(item, item.quantity);
                          }}
                          handleWriteNote={(e) => noteItem(item, e.target.value)}
                          changeWeightOption={changeWeightOption}
                          data={item}
                        />
                      ))
                    ) : (
                      <>
                        <StyledNoProductImg>
                          <NoCartBag />
                        </StyledNoProductImg>

                        <StyledNoProductMsg>
                          <FormattedMessage
                            id='noProductFound'
                            defaultMessage='No products found'
                          />
                        </StyledNoProductMsg>
                      </>
                    )}
                  </StyledItemsWrapper>
                </Scrollbar>

                <StyledCalculationWrapper>
                  <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage
                        id='subTotal'
                        defaultMessage='Subtotal'
                      />
                    </StyledText>
                    <StyledText>
                      {CURRENCY} <FormattedNumber value={detailPrice.subtotal} />
                    </StyledText>
                  </StyledTextWrapper>
                  {hasToAddExtra() && <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage
                        id='extra_product'
                        defaultMessage={extendItem.name}
                      />
                    </StyledText>
                    <StyledText>
                      {CURRENCY} <FormattedNumber value={extendItem.price} />
                    </StyledText>
                  </StyledTextWrapper>}

                  <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage
                        id='intlOrderDetailsDiscount'
                        defaultMessage='Discount'
                      />
                    </StyledText>
                    <StyledText>
                      {CURRENCY} <FormattedNumber value={-detailPrice.discount} />
                    </StyledText>
                  </StyledTextWrapper>

                  {/* <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage id="intlOrderDetailsVat" defaultMessage="VAT" />
                    </StyledText>
                    <StyledText>
                      {CURRENCY} <FormattedNumber value={detailPrice.vat_fee} />
                    </StyledText>
                  </StyledTextWrapper> */}

                  {/* <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage
                        id='intlOrderDetailsDelivery'
                        defaultMessage='Delivery Fee'
                      />
                    </StyledText>
                    <StyledText>{CURRENCY} <FormattedNumber value={detailPrice.delivery_fee} /></StyledText>
                  </StyledTextWrapper> */}

                  <StyledTextWrapper>
                    <StyledText>
                      <FormattedMessage
                        id='intlOrderDetailsTotalWeight'
                        defaultMessage='Total Weight'
                      />
                    </StyledText>
                    <StyledText><FormattedNumber value={detailPrice.total_weight} />{WEIGHT}</StyledText>
                  </StyledTextWrapper>

                  <StyledTextWrapper style={{ marginTop: 20 }}>
                    <StyledBold>
                      <FormattedMessage id='totalText' defaultMessage='Total' />{' '}
                      <StyledSmall>
                        <FormattedMessage
                          id='vatText'
                          defaultMessage='Incl. VAT'
                        />
                      </StyledSmall>
                    </StyledBold>
                    <StyledBold>
                      {CURRENCY} <FormattedNumber value={hasToAddExtra() ? detailPrice.amount + extendItem.price : detailPrice.amount} />
                    </StyledBold>
                  </StyledTextWrapper>

                  <StyledTextWrapper>
                    <StyledText style={{ color: '#ff5b60' }}>
                      {settingMap[detailPrice.error]
                        ? settingMap[detailPrice.error].value.exceed_message_frontend.value
                        : detailPrice.error.startsWith('out_of_stock') ? <FormattedMessage id='productIsOutOfStock' defaultMessage='Some products are out of stock. Please check your cart again.' /> : ''}
                    </StyledText>
                  </StyledTextWrapper>
                </StyledCalculationWrapper>
              </StyledOrderInfo>
            </Sticky>
          </StyledCartWrapper>
        </StyledCheckoutContainer>
      </CheckoutWrapper>
    </form>
  );
};

export default CheckoutWithSidebar;
