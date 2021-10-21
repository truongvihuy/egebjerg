import { useState, useEffect } from 'react';

import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import CommandInForm from 'app/kendo/CommandInForm';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED } from 'app/constants';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
});

const TagForm = props => {
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const { errors } = formState;
  const onSubmit = data => {
    props.onSubmit(data);
  };

  return (
    <form className="w-400" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdater Mærke' : 'Opret Mærke'}</DialogTitle>
      <DialogContent>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              id="name"
              label="Navn *"
              fullWidth
              autoFocus
              error={!!errors.name}
              helperText={errors?.name?.message}
            />
          )}
        />
      </DialogContent>
      <CommandInForm {...props} />
    </form>
  );
};

export default TagForm;
