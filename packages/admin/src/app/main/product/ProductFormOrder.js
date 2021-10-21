import { useState, useEffect, useRef, useImperativeHandle, ref, forwardRef } from 'react';

import { DialogContent, DialogTitle, TextField, TextareaAutosize, Switch } from '@material-ui/core';
import { Upload } from "@progress/kendo-react-upload";
import CommandInForm from 'app/kendo/CommandInForm';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED } from 'app/constants';
import * as yup from 'yup';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

const schema = yup.object().shape({
  order: yup.number().required(MSG_REQUIRED),
});

const ProductFormOrder = props => {
  const [itemModel, setItemModel] = useState(props.dataItem);
  const { control, setValue, formState, handleSubmit, reset, trigger, setError } = useForm({
    mode: 'onChange',
    itemModel,
    resolver: yupResolver(schema)
  });
  const { isValid, dirtyFields, errors } = formState;
  useEffect(() => {
    reset(props.dataItem);
  }, [props.dataItem]);

  const onSubmit = async data => {
    props.onSubmit(data);
  };
  return (
    <form className="w-600" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{itemModel._id ? 'Opdater product' : 'Opret product'}</DialogTitle>
      <DialogContent>
        <Controller
          name="order"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-10"
              id="order"
              label="Order *"
              defaultValue={0}
              fullWidth
              error={!!errors.order}
              helperText={errors?.order?.message}
            />
          )}
        />
      </DialogContent>
      <CommandInForm {...props} itemModel={itemModel} />
    </form>
  );

};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showErrorMessage,
      showSuccessMessage,
    },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(ProductFormOrder);