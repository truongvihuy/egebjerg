import React, { useState, useEffect } from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import CommandInForm from 'app/kendo/CommandInForm';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { MSG_REQUIRED } from 'app/constants';

import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
});

const processPermissionToSend = permissionView => {
  const newPermission = {};
  for (const key in permissionView) {
    newPermission[key] = permissionView[key].toString(2);
  }
  return newPermission;
};

const UserGroupForm = props => {
  const [itemModel, setItemModel] = useState(props.dataItem);
  const [userGroupList] = useState(props.userGroupList ?? null);
  const { control, setValue, formState, handleSubmit, reset, trigger, setError } = useForm({
    mode: 'onChange',
    itemModel,
    resolver: yupResolver(schema),
  });
  useEffect(() => {
    reset(itemModel);
  }, [itemModel]);

  const { isValid, dirtyFields, errors } = formState;
  return (
    <form style={{ width: '400px' }} onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{itemModel?._id ? 'Opdater gruppe' : 'Opret gruppe'}</DialogTitle>
      <DialogContent>
        <Controller
          className="mt-20"
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              autoFocus={true}
              {...field}
              value={field.value ?? ''}
              id="name"
              label="Navn *"
              fullWidth
              error={!!errors.name}
              helperText={errors?.name?.message}></TextField>
          )}
        />
        {userGroupList ? (
          <Controller
            name="permission"
            control={control}
            render={({ field }) => (
              <TextField
                className="mt-20"
                id="permission"
                label="Kopier fra gruppe"
                fullWidth
                select
                defaultValue=""
                onChange={e => {
                  field.onChange(processPermissionToSend(e.target.value.permission));
                }}>
                {userGroupList.map(option => (
                  <MenuItem key={option._id} value={option}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : null}
      </DialogContent>

      <CommandInForm {...props} itemModel={itemModel} remove={false} />
    </form>
  );
};

export default UserGroupForm;
