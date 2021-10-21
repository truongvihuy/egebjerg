import { useEffect, useRef, useState } from 'react';
import { Icon, IconButton, Select, MenuItem } from '@material-ui/core';
import axios from 'app/axios';
import { InputQuantity, OfferBadgeNote } from 'app/kendo/OfferBadge';
import { formatCurrency, formatWeight, isFreeNameProduct, } from 'app/helper/general.helper';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { checkProductStock } from 'app/helper/order.helper';
import { ItemNumberCellInCustomDiv } from 'app/kendo/CustomCell';

export const ProductOption = ({ option, cartItemList, customer, productInOrder, disabled, onSelect, onAdd, ariaSelected, autoFocus, offerBadge, stateDialog }) => {
  const [weightOption, setWeightOption] = useState(productInOrder?.weight_option ?? option.weight_list?.[0] ?? null);
  let outStock = !!option._id && !checkProductStock(option, customer);
  const [focus, setFocus] = useState(false);
  const productOptionRef = useRef();
  const [open, setOpen] = useState(false);

  const itemInCart = cartItemList?.find(e => (
    isFreeNameProduct(option._id)
      ? (e.cart.name === productInOrder?.name && option._id === e.cart._id)
      : ((option._id === e.cart._id) &&
        (weightOption ? weightOption === e.cart.weight_option : true))
  ));

  useEffect(() => {
    if (autoFocus) {
      if (!focus) {
        setFocus(true);
        if (option.weight_list?.length) {
          setOpen(true);
        } else if (!itemInCart || !itemInCart.cart.quantity) {
          productOptionRef.current.querySelector('.add-to-cart')?.click();
        }
      }
    } else {
      setOpen(false);
      setFocus(false);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (focus) {
      productOptionRef.current.querySelector('.add-to-cart')?.click();
      setTimeout(() => {
        productOptionRef.current.querySelector('.quantity input')?.focus();
      }, 500);
    }
  }, [weightOption]);

  useEffect(() => {
    if (focus) {
      if (!(option.weight_list?.length)) {
        productOptionRef.current.querySelector('.quantity input')?.focus();
      }

      const handleKeyArrow = (e) => {
        switch (e.code) {
          case 'Escape': {
            onSelect(option, false);
            document.getElementById('search-input')?.focus();
            break;
          }
          case 'Enter': {
            e.preventDefault();
            productOptionRef.current.querySelector('.quantity input')?.focus();
            break;
          }
          default:
        }
      }
      document.addEventListener('keydown', handleKeyArrow);
      return () => {
        document.removeEventListener('keydown', handleKeyArrow);
      }
    }
  }, [focus]);

  const onChangeIncreaseQuantity = (increase) => {
    if (itemInCart) {
      const quantity = (itemInCart.cart.quantity ?? 0) + increase;
      if (quantity >= 0) {
        const value = {
          ...itemInCart,
          product: option,
          cart: {
            ...itemInCart.cart,
            quantity,
          }
        };

        onAdd(value, itemInCart);
        if (quantity === 0) {
          onSelect(option, false);
        }
      }
    } else {
      let associatedIdList = option.associated_list?.filter(e => e.amount).map(e => e._id);
      if (associatedIdList?.length) {
        let params = {
          id_list: associatedIdList.join(','),
          status: 'active',
        };

        axios.get(`/products`, { params }).then(response => {
          onAdd({
            product: option,
            associated_list: response.data.data.product_list.map(ele => {
              const associatedItem = option.associated_list.find(e => e._id === ele._id);
              ele.amount = associatedItem.amount;
              return ele;
            }),
            cart: isFreeNameProduct(option._id)
              ? {
                _id: option._id,
                name: productInOrder?.name ?? '',
                position: 1,
                quantity: 1,
                note: null,
              }
              : {
                _id: option._id,
                quantity: 1,
                position: 1,
                weight_option: weightOption,
                note: cartItemList.find(e => e.cart._id === option._id)?.cart.note ?? null,
              }
          }, null);
        });
      } else {
        onAdd({
          product: option,
          cart: isFreeNameProduct(option._id)
            ? {
              _id: option._id,
              name: productInOrder?.name ?? '',
              position: 1,
              quantity: 1,
              note: null,
            }
            : {
              _id: option._id,
              quantity: 1,
              position: 1,
              weight_option: weightOption,
              note: cartItemList.find(e => e.cart._id === option._id)?.cart.note ?? null,
            }
        }, null);
      }
    }
  };

  const onChangeQuantity = (e) => {
    const value = {
      product: option,
      ...itemInCart,
      cart: {
        ...itemInCart.cart,
        quantity: e,
      }
    };

    if (e === 0) {
      onSelect(option, false);
    }

    return onAdd(value, itemInCart);
  };

  return (
    <div ref={productOptionRef} className={`item-option flex ${outStock || disabled ? 'disabled' : ''} ${autoFocus ? 'focus' : ''}`}
      aria-selected={ariaSelected} data-type="product"
      onClick={onSelect && !outStock ? () => { if (!autoFocus) onSelect(option, false); } : null}>
      <ItemNumberCellInCustomDiv dataItem={option} style={{ width: 60, alignSelf: 'center' }} />
      <ImagePopOver src={option.image} />

      <div style={{ padding: '0px 10px' }}>
        <div>
          <span >{option.name} {productInOrder && isFreeNameProduct(productInOrder._id) && `  |  ${productInOrder?.name}`}</span>
          {option.offer && <Icon fontSize='small' color='primary'>local_offer</Icon>}
        </div>
        <div>
          <span>
            {formatCurrency(option.price)}
            {!!option.unit && (<>&emsp;-&emsp;{option.unit}</>)}
          </span>
          {onAdd && !disabled && !outStock && (
            <>
              {option.weight_list?.length ? (
                <span>
                  <Select value={weightOption} open={open} style={{ marginLeft: 60 }}
                    onOpen={e => {
                      setOpen(true);
                      if (!autoFocus) {
                        onSelect(option, true);
                      }
                    }}
                    onChange={(e) => {
                      setWeightOption(e?.target?.value ?? weightOption);
                    }}
                    onClose={e => {
                      setOpen(false);
                    }}
                  >
                    {option.weight_list.map((e, index) => (
                      <MenuItem key={index} value={e}>{formatWeight(e)}</MenuItem>
                    ))}
                  </Select>
                </span>
              ) : null}
              <span>
                {itemInCart && itemInCart.cart.quantity ? (
                  <InputQuantity className='quantity' value={itemInCart.cart.quantity} onChange={onChangeQuantity}
                    focus={autoFocus}
                    onFocus={() => {
                      if (!autoFocus) {
                        onSelect(option, true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (['ArrowLeft', 'ArrowRight'].includes(e.code)) {
                        e.preventDefault();
                      }
                    }}
                    onBlur={() => {
                      onSelect(option, false);
                      document.getElementById('search-input')?.focus();
                    }}
                  />
                ) : (
                  <IconButton className='add-to-cart' color='primary' onClick={() => onChangeIncreaseQuantity(1)}>
                    <Icon fontSize='small'>add_shopping_cart</Icon></IconButton>
                )}
              </span>
            </>
          )}
        </div>
        {offerBadge && option.offer && (
          <OfferBadgeNote offer={option.offer} data={option} cartItemList={cartItemList} onChange={onAdd} stateDialog={stateDialog} />
        )}
        {disabled ? <div style={{ color: 'red' }}>Produktet er inaktiv tilstand</div> : outStock && <div style={{ color: 'red' }}>Denne vare er ikke tilgængelig i denne butik.</div>}
      </div>
    </div>
  )
};