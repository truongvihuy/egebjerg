import { useEffect, useRef, useState } from 'react';
import { Icon, IconButton, DialogContent, Input, Select, MenuItem } from '@material-ui/core';
import axios from 'app/axios';
import { OFFER_TYPE, OFFER_TYPE_CONFIG } from 'app/constants';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { formatCurrency, formatWeight } from 'app/helper/general.helper';
import ImagePopOver from 'app/shared-components/ImagePopOver';

export const InputQuantity = (props) => {
  const [value, setValue] = useState(props.value);
  const timer = useRef(null);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const onChange = (event) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (+event.target.value >= 0) {
      setValue(event.target.value);
      if (event.target.value) {
        timer.current = setTimeout(() => {
          const resultAddCart = props.onChange(+event.target.value, 'change');
          if (!resultAddCart.updatedCart) {
            setValue(props.value);
          }
          timer.current = null;
        }, 300);
      }
    }
  };

  const onChangeQuantity = (inc) => {
    if (+value + inc >= 0) {
      props.onChange(+value + inc, inc > 0 ? 'increase' : 'decrease');
    }
  }

  const onBlur = (e) => {
    if (props.resetValueOnBlur) {
      setValue(props.value);
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <span style={props.style}>
      <IconButton color='primary' disabled={props.disabled} onClick={() => onChangeQuantity(-1)}>
        <Icon fontSize='small'>remove</Icon></IconButton>
      <Input onBlur={props.resetValueOnBlur || props.onBlur ? onBlur : null} autoFocus={props.focus}
        name={props.name} id={props.id} className={props.className} min="0"
        style={{ width: '30px', textAlignLast: 'center' }}
        type='number' disabled={props.disabled} onFocus={props.onFocus ?? null}
        onKeyDown={props.onKeyDown ?? null} onKeyUp={props.onKeyUp ?? null}
        value={value} onChange={onChange} />
      <IconButton color='primary' disabled={props.disabled} onClick={() => onChangeQuantity(1)}>
        <Icon fontSize='small'>add</Icon></IconButton>
    </span>
  );
};

const ProductItem = ({ product, cartItemList, onChange, disabled }) => {
  const [weight_option, set_weight_option] = useState(product.weight_list?.[0] ?? null);

  const itemCart = cartItemList.find(e => (
    (product._id === e.cart._id) &&
    (weight_option ? weight_option === e.cart.weight_option : true)
  ));

  const onChangeIncreaseQuantity = (increase) => {
    if (itemCart) {
      const value = {
        ...itemCart,
        product,
        cart: {
          ...itemCart.cart,
          quantity: (itemCart?.cart.quantity ?? 0) + increase,
        }
      };

      onChange(value, itemCart);
    } else {
      let associated_list = product.associated_list?.filter(e => e.amount).map(e => e._id);
      if (associated_list?.length) {
        let params = {
          id_list: associated_list.join(','),
        };

        axios.get(`/products`, { params }).then(response => {
          onChange({
            product,
            associated_list: response.data.data.product_list.map(ele => {
              const associated_item = product.associated_list.find(e => e._id === ele._id);
              ele.amount = associated_item.amount;
              return ele;
            }),
            cart: {
              _id: product._id,
              quantity: 1,
              weight_option,
              note: cartItemList.find(e => e.cart._id === product._id)?.cart.note ?? null,
            }
          }, null);
        });
      } else {
        onChange({
          product,
          cart: {
            _id: product._id,
            quantity: 1,
            weight_option,
            note: cartItemList.find(e => e.cart._id === product._id)?.cart.note ?? null,
          }
        }, null);
      }
    }
  }

  const onChangeQuantity = (e) => {
    const value = {
      product,
      ...itemCart,
      cart: {
        ...itemCart.cart,
        quantity: e,
      }
    };

    return onChange(value, itemCart);
  };

  return (
    <div style={{ display: 'flex', border: '1px solid #ccc', padding: 8, margin: '4px 0px' }}>
      <span style={{ width: 60, alignSelf: 'center' }}>{product.item_number?.[0]}</span>
      <span style={{ marginRight: '10px' }}>
        <ImagePopOver src={product.image} />
      </span>
      <span>
        <b>{product.name}</b>
        <div style={{ display: 'flex' }}>
          <span>
            <div>{formatCurrency(product.price)}</div>
          </span>
          {product.weight_list?.length ? (
            <span>
              <Select value={weight_option} style={{ marginLeft: 60 }} onChange={(e) => set_weight_option(e?.target?.value ?? weight_option)}>
                {product.weight_list.map((e, index) => (
                  <MenuItem key={index} value={e}>{formatWeight(e)}</MenuItem>
                ))}
              </Select>
            </span>
          ) : null}
          {!disabled && (
            <>
              {itemCart && itemCart.cart.quantity ? (
                <InputQuantity style={{ display: 'flex' }} className={`product-${product._id}`} value={itemCart.cart.quantity} onChange={onChangeQuantity} />
              ) : (
                <span>
                  <IconButton color='primary' onClick={() => onChangeIncreaseQuantity(1)}>
                    <Icon fontSize='small'>add_shopping_cart</Icon></IconButton>
                </span>
              )}
            </>
          )}
        </div>
      </span>
    </div>
  )
}

const OfferDialog = ({ offer, cartItemList, onChange, disabled = false }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let params = {
      id_list: offer.product_id_list.join(','),
    };

    axios.get(`/products`, { params }).then(response => {
      setProducts(response.data.data.product_list);
    });
  }, []);

  const onChangeCart = (nextValue, preValue) => {
    const resultAddCart = onChange(nextValue, preValue);

    return resultAddCart;
  }

  return (
    <div>
      <DialogContent>
        <OfferBadgeNote offer={offer} data={products[0]} disabledClick />
        {products.map((product, index) => (
          <ProductItem key={index} cartItemList={cartItemList} disabled={disabled} product={product} onChange={onChangeCart} />
        ))}
      </DialogContent>
    </div>
  );
};


let OfferBadge = ({ offer, cartItemList, openDialog, closeDialog, onChange, disabledClick }) => {
  const onClickBadge = () => {
    openDialog({
      maxWidth: 'lg',
      children: <OfferDialog offer={offer} cartItemList={cartItemList} onChange={onChange} cancel={closeDialog} />,
    });
  };

  switch (offer?.type) {
    case OFFER_TYPE.MEMBER:
    case OFFER_TYPE.PRICE:
    case OFFER_TYPE.QUANTITY:
    case OFFER_TYPE.LIMIT:
    case OFFER_TYPE.LIMIT_COMBO:
    case OFFER_TYPE.COMBO: {
      const type = OFFER_TYPE_CONFIG[offer.type];
      return (
        <span className='offer-badge' style={{
          backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
        }}
          onClick={disabledClick ? null : onClickBadge}
        >{type.name}</span>
      )
    }
    default: return null;
  }
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog
    },
    dispatch
  );
}
OfferBadge = connect(null, mapDispatchToProps)(OfferBadge);
export { OfferBadge };

export const OfferBadgeNote = ({ offer, cartItemList, data, onChange, stateDialog, disabledClick, disabled, style }) => {
  const isOpen = useRef(false);
  const state = useSelector(({ fuse }) => fuse.dialog.state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (stateDialog ? stateDialog.open : state) {
      if (isOpen.current) {
        onClickBadge();
      }
    } else {
      isOpen.current = false;
    }
  }, [cartItemList]);

  const open = (options) => {
    if (stateDialog?.openDialog) {
      stateDialog.openDialog(options);
    } else {
      dispatch(openDialog(options));
    }
  }

  const close = () => {
    if (stateDialog?.closeDialog) {
      stateDialog.closeDialog();
    } else {
      dispatch(closeDialog());
    }
  }

  const onClickBadge = () => {
    isOpen.current = true;
    open({
      maxWidth: 'lg',
      children: <OfferDialog offer={offer} cartItemList={cartItemList} onChange={onChange} disabled={disabled} cancel={close} />,
    });
  };

  switch (offer?.type) {
    case OFFER_TYPE.MEMBER:
    case OFFER_TYPE.PRICE: {
      return <span style={{
        backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
      }} className='offer-badge' onClick={disabledClick ? null : onClickBadge}>
        SPAR {formatCurrency(data?.price - offer.sale_price)}
      </span>
    }
    case OFFER_TYPE.QUANTITY: {
      return <span style={{
        ...style,
        backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
      }} className='offer-badge' onClick={disabledClick ? null : onClickBadge}>
        {offer.quantity} stk. for {formatCurrency(offer.sale_price)}
      </span>
    }
    case OFFER_TYPE.LIMIT: {
      return <span style={{
        ...style,
        backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
      }} className='offer-badge' onClick={disabledClick ? null : onClickBadge}>
        MAX KØB til tilbudspris {offer.quantity} stk.
      </span>
    }
    case OFFER_TYPE.LIMIT_COMBO: {
      return (
        <span style={{
          ...style,
          backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
        }} className='offer-badge' onClick={disabledClick ? null : onClickBadge}>
          MAX KØB til tilbudspris {offer.quantity} stk.
        </span>
      );
    }
    case OFFER_TYPE.COMBO: {
      return <span style={{
        ...style,
        backgroundColor: OFFER_TYPE_CONFIG[offer.type].color,
      }} className='offer-badge' onClick={disabledClick ? null : onClickBadge}>
        Mix {offer.quantity} stk. for {formatCurrency(offer.sale_price)}
      </span>
    }
    default: return null;
  }
};