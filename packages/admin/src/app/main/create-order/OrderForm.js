import React, { useEffect, useState } from 'react';
import { DialogActions, Button, CircularProgress, Icon } from '@material-ui/core';
import { CustomerInfo, Price, ProductCart, SearchProduct, ReplacementGoods, PaymentMethod, NoteOrder, AdminComment, Store, MemberShipNumber } from 'app/shared-components/OrderInfo';
import axios from 'app/axios';
import { withRouter } from 'react-router';
import { processOrderItemList } from 'app/helper/order.helper';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import ConfirmDialog from 'app/shared-components/ConfirmDialog';
import { isFreeNameProduct } from 'app/helper/general.helper';
import { PAYMENT_METHOD, PAYMENT_METHOD_NO_PAYMENT, MSG_REQUIRED, MSG_DO_NOT_HAVE_SAVED_CARD, MSG_CARD_INFORM_MISSING, MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT } from 'app/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useKeyListener } from 'app/shared-components/KeyListener';
import { cloneDeep } from 'lodash';
const initData = {
  status: 1,
  date: 0,
  note: null,

  replacement_goods: null,
  payment_method: null,
  customer_id: null,
  customer_name: null,
  address_info: null,
  delivery_fee: 0,
  shipping_code: null,

  product_list: [],
  discount: 0,
  subtotal: 0,
  overweight_fee: 0,
  total_weight: 0,
  amount: 0,
};

let cartItemList = [];
let isCartSaved = true;
let handleSaveCartRef = null;
let settings = null;

const OrderForm = (props) => {
  const [value, setValue] = useState(initData);
  const [customer, setCustomer] = useState(null);
  const [focusProduct, setFocusProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const processInitData = () => {
    setCustomer(null);
    setValue(initData);
    setFocusProduct(null);
    isCartSaved = true;
    props.closeDialog();
  };
  useKeyListener(null, processInitData);

  const state = useSelector(({ fuse }) => fuse.dialog.state);

  const handleError = (error) => {
    let message;
    if (error.startsWith('out_of_stock')) {
      message = `${error.split(':')[1]} \n er udsolgt`;
    } else {
      let pbs_setting = settings.find(ele => ele.key === error);
      message = pbs_setting?.value?.exceed_message_backend.value ?? 'Der er en fejl'
    }
    props.showErrorMessage(message);
  }

  // listen change route
  useEffect(() => {
    cartItemList = [];
    isCartSaved = true;
    handleSaveCartRef = null;
    settings = null

    axios.get(`/settings`).then(response => {
      settings = response.data.data
    });

    const unblock = props.history.block((location) => {
      if (isCartSaved) {
        return true;
      } else {
        props.openDialog({
          children: <ConfirmDialog title='Gem kurv'
            handleYes={() => {
              handleSaveCartRef(false);
              isCartSaved = true;
              props.history.push(location);
              props.closeDialog();
            }}
            handleNo={() => {
              isCartSaved = true;
              cartItemList = [];
              props.history.push(location);
              props.closeDialog();
            }} />
        });
        return false;
      }
    });
    return () => {
      unblock();
    }
  }, []);

  // key press F3
  useEffect(() => {
    if (!state) {
      function handlePress(event) {
        switch (event.code) {
          case 'F3':
            event.preventDefault();
            let btnSearch = document.getElementById('suggest-search');
            if (btnSearch) {
              btnSearch.click();
            }
            break;
          case 'F4':
            event.preventDefault();
            let btnOrderHistory = document.getElementById('btn-order-history');
            if (btnOrderHistory) {
              btnOrderHistory.click();
            }
            break;
          default:
            break;
        }
      }
      window.addEventListener('keydown', handlePress);
      return () => window.removeEventListener('keydown', handlePress);
    }
  }, [state]);

  // listen add cart
  useEffect(() => {
    if (focusProduct) {
      let input = document.querySelector(`.product-${focusProduct.position} input`);
      input?.focus();
    }
  }, [focusProduct]);

  // get cart when change customer
  useEffect(() => {
    if (customer) {
      let apiGetCart = () => {
        axios.get(`/customers/${customer._id}/cart`, {}).then(({ data }) => {
          cartItemList = data.data.product_list;
          const order = processOrderItemList(cartItemList, customer, value);
          const { error } = order;
          setValue({
            ...value,
            ...order,
            note: data.data.note,
          });
          if (error) {
            handleError(error);
          }
        });
      };
      apiGetCart();
    }
  }, [customer]);

  // confirm reload and leave tab without saving cart
  useEffect(() => {
    function listener(event) {
      if (!isCartSaved) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    }
    window.addEventListener('beforeunload', listener);
    return () => {
      window.removeEventListener('beforeunload', listener);
    };
  }, [isCartSaved]);

  const handleSubmit = () => {
    if (!value.shipping_code) {
      setError({ shipping_code: MSG_REQUIRED })
      return;
    }

    let dataSend = { ...value };
    //check card missing
    if (dataSend.payment_method === 'Card' && customer.card == null || customer.card == [] ) {
      if (customer.credit_limit < dataSend.amount) {
        props.showErrorMessage(MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT);
        return;
      }
      props.showErrorMessage(MSG_CARD_INFORM_MISSING);
      dataSend.payment_method = 'PBS';
      dataSend.card_to_pbs = true;
    }
    setLoading(true);
    axios.post(`/orders`, dataSend)
      .then(response => {
        isCartSaved = true;
        setLoading(false);

        props.openDialog({
          children: <ConfirmDialog title='Du vil skifte siden til ordrer?'
            handleNo={() => {
              setValue({ ...initData });
              setCustomer(null);
              cartItemList = [];
              props.closeDialog();
            }}
            handleYes={() => {
              props.history.push(`/order`);
              props.closeDialog();
            }} />
        });

        if (response.data.data.error_message) {
          props.showErrorMessage(response.data.data.error_message);
        } else {
          props.showSuccessMessage();
        }
      }).catch(e => {
        setLoading(false);
      });
  };

  const handleClean = () => {
    props.openDialog({
      children: <ConfirmDialog title={<>Du vil tømme vognen?</>}
        handleNo={() => {
          props.closeDialog();
        }}
        handleYes={() => {
          axios.delete(`/customers/${customer._id}/cart`).then(response => {
            cartItemList = [];
            isCartSaved = true;
            setValue({
              ...value,
              ...processOrderItemList(cartItemList, customer, value),
            });

            props.closeDialog();
            props.showSuccessMessage();
          });
        }} />
    });
  };

  const handleSaveCart = (confirmReset = true) => {
    let productList = [];
    cartItemList.forEach(item => {
      productList.push({
        _id: item.cart._id,
        name: item.cart.name,
        quantity: item.cart.quantity,
        note: item.cart.note,
        position: item.cart.position,
        weight_option: item.cart.weight_option,
      });
    });
    axios.put(`/customers/${customer._id}/cart_multi`, { product_list: productList, note: value.note }).then(({ data }) => {
      cartItemList = data.data.product_list;
      isCartSaved = true;

      if (confirmReset) {
        props.openDialog({
          children: <ConfirmDialog title={<>Gemt med succes !!!<br /> Vil du oprette en ny ordre?</>}
            handleNo={() => {
              setValue({
                ...value,
                note: data.data.note,
                ...processOrderItemList(cartItemList, customer, value),
              });
              props.closeDialog();
            }}
            handleYes={() => {
              cartItemList = [];
              setValue({ ...initData });
              setCustomer(null);
              props.closeDialog();
            }} />
        });
      }

      props.showSuccessMessage();
    });
  };

  const onAdd = (nextCartItem, preCartItem = null, focus = false) => {
    if (!customer) {
      return false;
    }
    let { cart, product } = nextCartItem;
    // handle cart
    let newCart = cloneDeep(cartItemList);
    if (isFreeNameProduct(cart._id)) {
      if (preCartItem) {
        if (cart.quantity > 0) {
          newCart.forEach(item => {
            if (item.cart.position === nextCartItem.cart.position) {
              item.cart = nextCartItem.cart;
            }
          });
        } else {
          newCart = newCart.filter(item => !(item.cart.position === nextCartItem.cart.position));
        }
      } else {
        if (cart.quantity > 0) {
          newCart = newCart.map(item => {
            let tmp = cloneDeep(item);
            tmp.cart.position++;
            return tmp;
          });
          nextCartItem.cart.position = 1;
          newCart.push(nextCartItem);
        }
      }
    } else {
      if (preCartItem) {
        if (cart.quantity > 0) {
          let flagUpdate = true;
          newCart = newCart.map(item => {
            if (item.cart._id === nextCartItem.cart._id) {
              if (nextCartItem.cart.weight_option ? nextCartItem.cart.weight_option === item.cart.weight_option : true) {
                let tmp = cloneDeep(nextCartItem);

                flagUpdate = false;
                return tmp;
              } else {
                let tmp = cloneDeep(item);
                tmp.cart.note = cart.note;
                return tmp
              }
            }
            return item;
          });
          if (flagUpdate) {
            newCart.push(nextCartItem);
          }
          if (nextCartItem.cart.weight_option !== preCartItem.cart.weight_option) {
            newCart = newCart.filter(item => !(
              (item.cart._id === preCartItem.cart._id) &&
              (preCartItem.cart.weight_option ? preCartItem.cart.weight_option === item.cart.weight_option : true)
            ));
          }
        } else {
          newCart = newCart.filter(item => !(
            (item.cart._id === nextCartItem.cart._id) &&
            (nextCartItem.cart.weight_option ? nextCartItem.cart.weight_option === item.cart.weight_option : true)
          ));
        }
      } else {
        if (cart.quantity > 0) {
          newCart = newCart.map(e => {
            let tmp = cloneDeep(e);
            tmp.cart.position++;
            return tmp;
          });
          nextCartItem.cart.position = 1;
          newCart.push(nextCartItem);
        }
      }
    }

    return onUpdateCartItemList(newCart, focus ? nextCartItem.cart : null);
  };

  const onUpdateCartItemList = (newCart, focusCart = null) => {
    const order = processOrderItemList(newCart, customer, value);
    if (order.error) {
      handleError(order.error);
    }
    if (!order.error || (order.error === 'pbs_settings' && order.amount <= value.amount)) {
      let newValue = {
        ...value,
        ...order,
      };

      cartItemList = newCart;
      setValue(newValue);
      setFocusProduct(focusCart);
      isCartSaved = false;
      return {
        updatedCart: true,
        haveError: !!order.error
      };
    }
    return {
      updatedCart: false,
      haveError: true
    };
  };

  const onChange = (val, field) => {
    let tmpValue = { ...value, [field]: val };
    if (field === 'membership_number') {
      tmpValue = {
        ...tmpValue,
        ...processOrderItemList(cartItemList, customer, tmpValue),
      };
    } else if (field === 'note') {
      isCartSaved = false;
    }
    if (error[field]) {
      let errorTmp = { ...error };
      delete errorTmp[field];
      setError(errorTmp);
    }
    setValue(tmpValue);
  };

  const onChangeCustomer = (customerValue) => {
    const onSelect = () => {
      isCartSaved = true;
      setCustomer(customerValue);
      if (!customerValue.store) {
        props.showErrorMessage('Brugser ikke fundet');
      }
      setValue({
        ...value,
        replacement_goods: customerValue.replacement_goods,
        payment_method: customerValue.store?.payment?.[0] && customerValue.store.payment[0] !== PAYMENT_METHOD_NO_PAYMENT ? customerValue.payment_method : PAYMENT_METHOD_NO_PAYMENT,
        delivery_fee: customerValue.delivery_fee ?? 0,
        customer_id: customerValue._id,
        customer_name: customerValue.name,
        phone: customerValue.phone,
        store: customerValue.store ? {
          _id: customerValue.store._id,
          name: customerValue.store.name,
        } : null,
        municipality: customerValue.municipality ? {
          _id: customerValue.municipality._id,
          name: customerValue.municipality.name,
        } : null,
        store_customer_number: customerValue.store_customer_number,
        membership_number: customerValue.membership_number,
        email: customerValue.email,
        address_info: {
          address: customerValue.address,
          zip_code: customerValue.zip_code?.zip_code,
          city: customerValue.zip_code?.city_name,
        },
        admin_comment: customerValue.admin_comment,
      });
    }
    if (isCartSaved) {
      onSelect();
    } else {
      if (customer && customer._id !== customerValue?._id) {
        props.openDialog({
          children: <ConfirmDialog title='Gem kurv'
            handleYes={() => {
              handleSaveCartRef(false);
              onSelect();
              props.closeDialog();
            }}
            handleNo={() => {
              onSelect();
              props.closeDialog();
            }} />
        });
      }
    }
  }

  handleSaveCartRef = handleSaveCart;

  return (
    <div className='container-default'>
      <div className='delivery-info'>
        <CustomerInfo dataItem={value} value={customer}
          onChangeCustomer={onChangeCustomer} error={error}
          onChange={onChange} />
        {customer ? (
          <>
            <SearchProduct id='suggest-search' cartItemList={cartItemList} customer={customer}
              onAdd={(nextCartItem, preCartItem, focus) => onAdd(nextCartItem, preCartItem, focus)}
              onUpdateCartItemList={onUpdateCartItemList}
            />
            <Price dataItem={value} customer={customer} />
          </>
        ) : null}
      </div>
      {customer && (
        <>
          <ProductCart focus={focusProduct} productList={value.product_list} cartItemList={cartItemList} onChange={onAdd} />
          <div className='container-info-order'>
            <div className='info-order'>
              <ReplacementGoods value={value.replacement_goods} customer={customer} onChange={(e) => onChange(e, 'replacement_goods')} />
              <AdminComment value={value.admin_comment} />
            </div>
            <div className='info-order'>
              {/* <PaymentMethod value={value.payment_method} customer={customer} onChange={(e) => onChange(e, 'payment_method')} /> */}
              <MemberShipNumber value={value.membership_number} customer={customer} onChange={(e) => onChange(e, 'membership_number')} />
              <Store value={value.store} />
              {customer.payment_method === PAYMENT_METHOD.Card.value && (!customer.card || customer.card.length === 0) && (
                <p style={{ color: 'red', marginTop: '10px' }}>{MSG_DO_NOT_HAVE_SAVED_CARD}</p>
              )}
            </div>
            <div className='note'>
              <NoteOrder value={value.note} onChange={(e) => onChange(e, 'note')} />
            </div>
          </div>
          {value.product_list.length ? <DialogActions>
            <div className='flex justify-around'>
              {loading && <CircularProgress size={15} />}
              <Button onClick={handleClean} disabled={loading} color='secondary'>
                <Icon size='small'>remove_shopping_cart</Icon>&nbsp; Slet
              </Button>
              <Button onClick={handleSaveCart} disabled={loading} style={loading ? null : { color: 'rgb(33, 150, 243)' }}>
                <Icon size='small'>save</Icon>&nbsp; Gem
              </Button>
              <Button type='button' disabled={loading || !!value.error} onClick={handleSubmit} color='primary'>
                Afslut bestilling
              </Button>
            </div>
          </DialogActions> : null}
        </>
      )}
    </div>
  )
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showSuccessMessage,
      showErrorMessage,
      openDialog,
      closeDialog,
    },
    dispatch
  );
}
export default withRouter(connect(null, mapDispatchToProps)(OrderForm));