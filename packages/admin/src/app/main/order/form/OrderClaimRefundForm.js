import React, { useEffect, useState } from 'react';

import { TextField, DialogTitle, DialogContent, MenuItem, Checkbox, FormControlLabel, Button, Icon } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CommandInForm from 'app/kendo/CommandInForm';
import { PAYMENT_METHOD, MSG_REQUIRED } from 'app/constants';
import NumberTextField from 'app/shared-components/NumberTextField';
const OrderClaimRefundForm = props => {
  const schema = yup.object().shape(props.type == 'payment_method' ? {
    updated_card: yup.mixed().when('payment_method', {
      is: 'Card',
      then: yup.boolean().required(MSG_REQUIRED),
    }),
  } : {});
  const { control, setValue, formState, handleSubmit, reset, trigger, setError, watch } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  let item = watch();

  const store = props.storeList.find(x => props.dataItem.store._id == x._id);
  const { errors, dirtyFields } = formState;
  return (
    <form className="w-400" onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.type == 'claim' ? 'Hæv ordre' : (props.type == 'refund' ? 'Tilbagebetaling' : 'Opdater betalingsmetode')}</DialogTitle>
      {props.type == 'claim' && (<>
        <DialogContent>
          <Controller
            name="amount_claim"
            control={control}
            render={({ field }) => (
              <NumberTextField
                {...field}
                autoFocus={true}
                id="amount_claim"
                label="Reel Total"
                fullWidth
                error={!!errors.amount_claim}
                helperText={errors?.amount_claim?.message}
              />
            )}
          />
          <div style={{ display: 'flex' }}>
            {props.dataItem.is_saved_card ? null : <Icon>info</Icon>}
            <span> Max amount: {props.dataItem.max_amount}</span>
          </div>
        </DialogContent>

        <CommandInForm
          pagePermission={props.pagePermission}
          dataItem={item}
          closeDialog={props.cancel}
        />
      </>)}
      {props.type == 'refund' && (<>
        <DialogContent>
          <Controller
            name="amount_refund"
            control={control}
            render={({ field }) => (
              <NumberTextField
                {...field}
                autoFocus={true}
                id="amount_refund"
                label="Refund Amound"
                fullWidth
                error={!!errors.amount_refund}
                helperText={errors?.amount_refund?.message}
              />
            )}
          />
        </DialogContent>
        <CommandInForm
          pagePermission={props.pagePermission}
          dataItem={item}
          closeDialog={props.cancel}
        />
      </>)}
      {props.type == 'payment_method' && (<>
        <DialogContent>
          <Controller
            name="payment_method"
            control={control}
            render={({ field }) => (
              <>
                <TextField
                  {...field}
                  fullWidth
                  value={store && store.payment.includes(field.value) ? field.value : ''}
                  onChange={e => {
                    field.onChange(e.target.value);
                  }}
                  id="payment_method"
                  select
                  error={!!errors.payment_method}
                  helperText={errors?.payment_method?.message}>
                  {store &&
                    store.payment.map(option => (
                      <MenuItem key={option} value={option}>
                        {PAYMENT_METHOD[option]?.label ?? option}
                      </MenuItem>
                    ))}
                </TextField>
                {field.value == 'Card' &&
                  <Controller
                    name="updated_card"
                    control={control}
                    render={(e) => {
                      return < FormControlLabel
                        className="mt-10"
                        control={< Checkbox color="primary" checked={!!e.field.value} onClick={() => e.field.onChange(!!!e.field.value)} />}
                        label="Tilføjet et nyt kort"
                      />
                    }}
                  />}
              </>
            )}
          />
        </DialogContent>
        <CommandInForm
          pagePermission={props.pagePermission}
          dataItem={item}
          closeDialog={props.cancel}
          isLoading={!(!!dirtyFields.updated_card || !!dirtyFields.payment_method)}
        />
      </>)}
    </form>
  )
}

export default OrderClaimRefundForm;