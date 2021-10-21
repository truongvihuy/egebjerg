import { useEffect, useRef, useState } from 'react';
import { Icon, IconButton, TextareaAutosize, Select, MenuItem, Link } from '@material-ui/core';
import { InputQuantity, OfferBadgeNote } from 'app/kendo/OfferBadge';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { formatCurrency, formatWeight, isFreeNameProduct } from 'app/helper/general.helper';
import ImagePopOver from 'app/shared-components/ImagePopOver';
import { DialogAddSpecialProduct } from '.';
import { ItemNumberCellInCustomDiv } from 'app/kendo/CustomCell';
import { cloneDeep } from 'lodash';

let CartItem = ({ dataItem, cartItemList = [], onChange, className, disabled, openDialog, closeDialog }) => {
  const [note, setNote] = useState(dataItem.note);
  const timer = useRef(null);
  const cartItem = cartItemList.find(item => isFreeNameProduct(dataItem._id)
    ? dataItem.position === item.cart.position
    : (
      (item.cart._id === dataItem._id) &&
      (dataItem.weight_option ? dataItem.weight_option === item.cart.weight_option : true)
    )
  );

  useEffect(() => {
    setNote(dataItem.note);
  }, [dataItem.note])

  const onChangeIncreaseQuantity = (increase) => {
    const value = cloneDeep(cartItem);
    value.cart.quantity += increase;

    onChange(value, cartItem);
  };
  const onChangeQuantity = (quantity, type) => {
    const value = cloneDeep(cartItem);

    if (type === 'change') {
      value.cart.quantity = quantity;
    } else if (type === 'increase') {
      value.cart.quantity++;
    } else {
      value.cart.quantity--;
    }

    return onChange(value, cartItem);
  };
  const onChangeNote = (note) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      const value = cloneDeep(cartItem);
      value.cart.note = note;

      onChange(value, cartItem);
      timer.current = null;
    }, 300);
    setNote(note);
  };
  const onChangeOption = (e) => {
    const weightOption = e.target.value;
    if (weightOption !== cartItem.cart.weight_option) {
      const value = cloneDeep(cartItem);
      value.cart.weight_option = weightOption;
      let item = cartItemList.find(e => (
        (e.cart._id === dataItem._id) &&
        (weightOption === e.cart.weight_option)
      ));

      if (item) {
        value.cart.quantity += item.cart.quantity;
      }

      onChange(value, cartItem);
    }
  }
  const onChangeProduct = (cart) => {
    const value = { cart: cart, };

    onChange(value, cartItem);
    closeDialog();
  }

  const showOfferRow = !!dataItem.discount;

  const classNameGroup = (type) => {
    if (type === 'product') {
      switch (dataItem.group) {
        case 'start': return 'start';
        case 'mid': return 'mid';
        case 'end': return showOfferRow ? 'mid' : 'end';
        case 'one': return showOfferRow ? 'start' : 'one';
        default: return '';
      }
    } else {
      switch (dataItem.group) {
        case 'start':
        case 'mid': return 'mid';
        case 'end':
        case 'one': return 'end';
        default: return '';
      }
    }
  }

  const onClickEditForm = () => {
    openDialog({
      children: <DialogAddSpecialProduct closeDialog={closeDialog} initValue={cartItem.cart} onSubmit={onChangeProduct} />
    });
  }

  return (
    <>
      <tr className={`${classNameGroup('product')} ${className} product`}>
        <td style={{ padding: '5px' }}>
          <div style={{ display: 'flex', paddingLeft: dataItem.associated_item_id ? '70px' : '' }}>
            <ItemNumberCellInCustomDiv dataItem={dataItem} style={{ width: 60, marginRight: 10, alignSelf: 'center' }} />
            <span style={{ marginRight: '10px' }}>
              {dataItem._id && !isFreeNameProduct(dataItem._id) ? (
                <Link href={`/product?id=${dataItem._id}`} target='_blank' rel='noopener'>
                  <ImagePopOver src={dataItem.image} />
                </Link>
              ) : (
                <ImagePopOver src={dataItem.image} />
              )}
            </span>
            <span>
              <h4>
                {dataItem.name}
                {dataItem.error && <span style={{ color: 'red' }}>er udsolgt</span>}
                {!disabled && isFreeNameProduct(dataItem._id) && (
                  <IconButton style={{ margin: 8 }} size='small' onClick={onClickEditForm}>
                    <Icon>edit</Icon>
                  </IconButton>
                )}
              </h4>
              <div style={{ display: 'flex' }}>
                <span>
                  {formatCurrency(dataItem.price)}
                  {dataItem._id && <>&emsp;-&emsp;{formatWeight(dataItem.weight)}</>}
                </span>
                {(cartItem ? cartItem.product?.weight_list?.length > 0 : dataItem.weight_option) ? (
                  <Select value={dataItem.weight_option} style={{ marginLeft: 60 }} disabled={disabled} onChange={onChangeOption}>
                    {cartItem ? cartItem.product?.weight_list.map((e, index) => (
                      <MenuItem key={index} value={e}>{formatWeight(e)}</MenuItem>
                    )) : <MenuItem value={dataItem.weight_option}>{formatWeight(dataItem.weight_option)}</MenuItem>}
                  </Select>
                ) : null}
              </div>
              <div style={{ marginTop: 6 }}>
                <OfferBadgeNote offer={dataItem.offer} data={dataItem} cartItemList={cartItemList} disabled={disabled} onChange={onChange} />
              </div>
            </span>
          </div>
        </td>
        <td>
          <div>
            {!disabled && !dataItem.associated_item_id && dataItem._id ? (
              <InputQuantity style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={`product-${dataItem.position}`} disabled={!!dataItem.error} resetValueOnBlur value={dataItem.quantity}
                onChange={onChangeQuantity} />
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>{dataItem.quantity}</div>
              </span>
            )}
          </div>
        </td>
        <td>
          {!dataItem.associated_item_id && (
            <TextareaAutosize style={{
              width: 'calc(100% - 8px)',
              margin: '4px',
              padding: '4px',
              resize: 'none',
              maxHeight: '64px',
              background: 'none',
              overflow: 'auto',
            }}
              minRows={3} disabled={disabled || !!dataItem.error || !dataItem._id}
              value={note ?? ''} onChange={!!dataItem.error || !dataItem._id ? null : (e) => onChangeNote(e.target.value)} />
          )}
        </td>
        <td>
          <span>{formatCurrency(dataItem.total + (dataItem.discount ?? 0))}</span>
        </td >
        {!disabled && (
          <td>
            {!dataItem.associated_item_id && dataItem._id && (
              <IconButton onClick={() => onChangeIncreaseQuantity(-dataItem.quantity)}>
                <Icon fontSize='small'>clear</Icon>
              </IconButton>
            )}
          </td>
        )}
      </tr>
      {showOfferRow && <tr className={`${classNameGroup('offer')} ${className} offer`}>
        <td>
          <div style={{ marginLeft: '145px' }}>
            <span>Rabat på {dataItem.name}</span>
          </div>
        </td>
        <td>
          <div style={{ textAlign: 'center' }}>
            <span>{dataItem.quantity}</span>
          </div>
        </td>
        <td></td>
        <td>
          <div><span>{formatCurrency(-dataItem.discount)}</span></div>
        </td>
        {!disabled && <td></td>}
      </tr>}
      {['one', 'end'].includes(dataItem.group) && <tr><td style={{ padding: '2px' }}></td></tr>}
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
    },
    dispatch
  );
}
CartItem = connect(null, mapDispatchToProps)(CartItem);
export { CartItem };