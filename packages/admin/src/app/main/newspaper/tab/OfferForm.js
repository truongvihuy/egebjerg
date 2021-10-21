import React from 'react';
import axios from 'app/axios';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ProductSearch from 'app/kendo/ProductSearch';
import * as yup from 'yup';
import { OFFER_TYPE_CONFIG, CURRENCY, SEARCH_DELAY_TIME, MSG_REQUIRED } from 'app/constants';
import { DetailProductList } from './OfferGrid';
import NumberTextField from 'app/shared-components/NumberTextField';
import { showErrorMessage } from 'app/store/fuse/messageSlice';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';

const schema = yup.object().shape({
  type: yup.number().required(MSG_REQUIRED),
  quantity: yup.number().required(MSG_REQUIRED),
  sale_price: yup.number().required(MSG_REQUIRED),
  product_id_list: yup.array().min(1, MSG_REQUIRED),
});

const optionsOfferType = Object.values(OFFER_TYPE_CONFIG);

const OfferForm = props => {
  const { control, formState, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const [productList, setProductList] = React.useState(props.dataItem.product_list ?? []);
  const [type, setType] = React.useState(OFFER_TYPE_CONFIG[props.dataItem.type]);
  const { errors } = formState;

  const onSubmit = data => {
    data.product_list = productList;
    props.onSubmit(data);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? 'Rediger' : 'Opret'}</DialogTitle>
      <DialogContent style={{ display: 'flex' }}>
        <div className="mr-10" style={{ width: '250px' }}>
          <Controller
            name="type"
            control={control}
            render={({ field }) =>
              type?.disabled !== field.name ? (
                <TextField
                  {...field}
                  id="type"
                  label="Tilbud *"
                  select
                  fullWidth
                  onChange={e => {
                    field.onChange(e.target.value);
                    setType(OFFER_TYPE_CONFIG[e.target.value]);
                  }}
                  error={!!errors.type}
                  helperText={errors?.type?.message ? MSG_REQUIRED : ''}>
                  {optionsOfferType.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : null
            }
          />
          <Controller
            name="sale_price"
            control={control}
            render={({ field }) => (
              <NumberTextField
                {...field}
                className="mt-10"
                id="sale_price"
                label="Tilbudspris *"
                fullWidth
                InputProps={{
                  startAdornment: <span className="mr-10">{CURRENCY}</span>,
                }}
                error={!!errors.sale_price}
                helperText={errors?.sale_price?.message ? MSG_REQUIRED : ''}
              />
            )}
          />
          <Controller
            name="quantity"
            control={control}
            render={({ field }) =>
              type?.disabled !== field.name ? (
                <NumberTextField
                  {...field}
                  className="mt-10"
                  id="quantity"
                  label="Antal *"
                  fullWidth
                  error={!!errors.quantity}
                  helperText={errors?.quantity?.message ? MSG_REQUIRED : ''}
                />
              ) : null
            }
          />
        </div>
        <div style={{ width: '100%' }}>
          <Controller
            name="product_id_list"
            control={control}
            render={({ field }) => (
              <>
                <ProductSearch onChange={value => {
                  if (value.just_backend) {
                    props.showErrorMessage('Kan ikke tilføje bare backend produkt');
                    return;
                  }
                  let tmpProduct = [];
                  if (productList.findIndex(e => e._id === value._id) === -1) {
                    tmpProduct = [...productList, value];
                  } else {
                    tmpProduct = productList.filter(e => e._id !== value._id);
                  }
                  setProductList(tmpProduct);
                  field.onChange(tmpProduct.map(e => e._id));
                }} />
                <DetailProductList
                  className="from-product-offer"
                  dataItem={{ product_list: productList }}
                  commandCell
                  onRemove={dataItem => {
                    let tmpProduct = productList.filter(e => e._id !== dataItem._id);
                    setProductList(tmpProduct);
                    field.onChange(tmpProduct.map(e => e._id));
                  }}
                />
                {errors.product_id_list ? <span style={{ color: 'red' }}>{errors.product_id_list.message}</span> : null}
              </>
            )}
          />
        </div>
      </DialogContent>
      {props.onSubmit && <CommandInForm {...props} />}
    </form>
  );
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
    },
    dispatch,
  );
}
export default connect(null, mapDispatchToProps)(OfferForm);
