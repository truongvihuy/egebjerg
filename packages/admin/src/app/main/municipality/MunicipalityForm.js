import React from 'react';

import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { MSG_REQUIRED } from 'app/constants';

import * as yup from 'yup';
import NumberTextField from 'app/shared-components/NumberTextField';

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  weight_limit: yup.number().required(MSG_REQUIRED).min(0, MSG_REQUIRED),
  overweight_price: yup.number().required(MSG_REQUIRED).min(0, MSG_REQUIRED)
});

const MunicipalityForm = props => {
  const { control, formState, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema)
  });
  const { errors } = formState;

  return (
    <form className="w-400" onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdatering' : 'Opret kommune'}</DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              className="mt-10"
              id="name"
              label="Navn *"
              fullWidth
              error={!!errors.name}
              helperText={errors?.name?.message}
            />
          )}
        />
        <Controller
          name="weight_limit"
          control={control}
          defaultValue="0"
          render={({ field }) => (
            <NumberTextField
              {...field}
              className="mt-10"
              id="weight_limit"
              label="Vægtgrænse *"
              fullWidth
              error={!!errors.weight_limit}
              helperText={errors.weight_limit && MSG_REQUIRED}
            />
          )}
        />
        <Controller
          name="overweight_price"
          control={control}
          defaultValue="0"
          render={({ field }) => (
            <NumberTextField
              {...field}
              className="mt-10"
              id="overweight_price"
              label="Overvægt pris *"
              fullWidth
              error={!!errors.overweight_price}
              helperText={errors.overweight_price && MSG_REQUIRED}
            />
          )}
        />
      </DialogContent>
      <CommandInForm {...props} />
    </form>
  );
};

export default MunicipalityForm;
