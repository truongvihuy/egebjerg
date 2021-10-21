import { Icon, IconButton, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { BUTTON_ADD_PRODUCT } from 'app/constants';
import axios from 'app/axios';
import Button from '@material-ui/core/Button';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { isFreeNameProduct } from 'app/helper/general.helper';
import { DialogSearchProduct, DialogAddSpecialProduct, DialogOrderHistory, OptionWeight, DialogMostBought } from '.';
import { useEffect } from 'react';

let isProductAdded = false;
let dialogIsOpen = '';

let SearchProduct = ({ cartItemList, customer, onAdd, onUpdateCartItemList, openDialog, closeDialog, id }) => {
  const state = useSelector(({ fuse }) => fuse.dialog.state);

  useEffect(() => {
    if (state) {
      if (dialogIsOpen) {
        switch (dialogIsOpen) {
          case 'DialogSearchProduct': openDialogSearchProduct(); break;
          case 'DialogOrderHistory': openDialogOrderHistory(); break;
          case 'DialogMostBought': openDialogMostBought(); break;
          default:
        }
      }
    } else {
      dialogIsOpen = '';
    }
  }, [onAdd, onUpdateCartItemList, state])
  const onAddNewProduct = (product, weight_option = null) => {
    let associatedIdList = product.associated_list?.filter(e => e.amount).map(e => e._id);
    if (associatedIdList?.length > 0) {
      let params = {
        id_list: associatedIdList.join(','),
        status: 'active',
      };

      axios.get(`/products`, { params }).then(response => {
        onAdd({
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
      onAdd({
        product,
        cart: {
          _id: product._id,
          quantity: 1,
          weight_option,
          note: cartItemList.find(e => e.cart._id === product._id)?.cart.note ?? null,
        }
      }, null, true);
    }
  }

  const onAddProduct = (product, weight_option = null) => {
    if (!isProductAdded) {
      let cartItem = cartItemList.find(e => (
        (e.cart._id === product._id) &&
        (weight_option ? e.cart.weight_option === weight_option : true)
      ));

      if (!cartItem) {
        onAddNewProduct(product, weight_option);
      } else {
        onAdd(cartItem, cartItem, true);
      }
      isProductAdded = true;
    }
  }

  const onAddExternalProduct = (product, cart) => {
    if (!isProductAdded) {
      onAdd({ product, cart }, null, true);
      closeDialog();
      isProductAdded = true;
    }
  }

  const onSelectProduct = (value) => {
    dialogIsOpen = ''
    if (isFreeNameProduct(value._id)) {
      // Fritekst
      openDialog({
        children: <DialogAddSpecialProduct closeDialog={closeDialog} onSubmit={(cart) => onAddExternalProduct(value, cart)} />
      });
    } else {
      if (value.weight_list?.length) {
        openDialog({
          children: <OptionWeight product={value} onAdd={onAddProduct} closeDialog={closeDialog} />,
        });
      } else {
        closeDialog();
        onAddProduct(value);
      }
    }
  };

  const onClick = (btn) => {
    isProductAdded = false;
    let cartItem = cartItemList.find(e => (e.cart._id === btn.product_id));

    if (!cartItem) {
      axios.get(`/products/${btn.product_id}`)
        .then(({ data }) => {
          if (data.data) {
            if (isFreeNameProduct(btn.product_id)) {
              openDialog({
                children: <DialogAddSpecialProduct closeDialog={closeDialog} onSubmit={(cart) => onAddExternalProduct(data.data, cart)} />
              });
            } else {
              onAddProduct(data.data);
            }
          }
        }).catch(e => { });
    } else {
      if (isFreeNameProduct(btn.product_id)) {
        openDialog({
          children: <DialogAddSpecialProduct closeDialog={closeDialog} onSubmit={(cart) => onAddExternalProduct(cartItem.product, cart)} />
        });
      } else {
        onAddProduct(cartItem.product);
      }
    }
  };

  const openDialogSearchProduct = () => {
    isProductAdded = false;
    dialogIsOpen = 'DialogSearchProduct';
    openDialog({
      disableEscapeKeyDown: true,
      fullWidth: true,
      maxWidth: 'lg',
      children: <DialogSearchProduct
        customer={customer}
        cartItemList={cartItemList}
        closeDialog={closeDialog}
        onSelect={onSelectProduct}
        onAdd={onAdd}
      />
    });
  };

  const openDialogOrderHistory = () => {
    dialogIsOpen = 'DialogOrderHistory';
    openDialog({
      disableEscapeKeyDown: true,
      fullWidth: true,
      maxWidth: 'lg',
      children: <DialogOrderHistory
        customer={customer}
        cartItemList={cartItemList}
        closeDialog={closeDialog}
        onAdd={onAdd}
        onUpdateCartItemList={onUpdateCartItemList}
      />
    });
  }

  const openDialogMostBought = () => {
    dialogIsOpen = 'DialogMostBought';
    openDialog({
      disableEscapeKeyDown: true,
      maxWidth: 'md',
      children: <DialogMostBought
        customer={customer}
        cartItemList={cartItemList}
        closeDialog={closeDialog}
        onSelect={onSelectProduct}
        onAdd={onAdd}
      />
    });
  }

  return (
    <div className='delivery-address'>
      <div style={{ width: '300px' }}>
        <div>
          <Button id={id} variant='outlined' color='primary' style={{ width: '65%', marginRight: 12 }} onClick={openDialogSearchProduct} title="[F3]">
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
            Søg produkt
          </Button>
          <IconButton color='primary' id="btn-order-history" onClick={openDialogOrderHistory} title="[F4] Ordre historik">
            <Icon fontSize='small'>library_books</Icon>
          </IconButton>
          <IconButton color='primary' id="btn-most-bought" onClick={openDialogMostBought} title="Mest købte">
            <Icon fontSize='small'>star</Icon>
          </IconButton>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          {BUTTON_ADD_PRODUCT.map(e => (
            <Button key={e.product_id} onClick={() => onClick(e)} color='primary'>
              {e.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
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
SearchProduct = connect(null, mapDispatchToProps)(SearchProduct);
export { SearchProduct };