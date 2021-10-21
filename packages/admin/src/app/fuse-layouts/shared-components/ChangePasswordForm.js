import { yupResolver } from '@hookform/resolvers/yup';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';
import { MSG_ENTER_YOUR_PASSWORD } from 'app/constants';
import { DialogContent, DialogActions, DialogTitle } from '@material-ui/core';
import axios from 'app/axios';
import { connect } from 'react-redux';
import { openDialog, closeDialog } from 'app/store/fuse/dialogSlice';
import { bindActionCreators } from '@reduxjs/toolkit';
import { showSuccessMessage, showErrorMessage } from 'app/store/fuse/messageSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  old_password: yup.string().required(MSG_ENTER_YOUR_PASSWORD),
  new_password: yup.string().required(MSG_ENTER_YOUR_PASSWORD),
});

const defaultValues = {
  old_password: '',
  new_password: '',
  confirm_new_password: ''
};

const ChangePasswordForm = props => {
  const { control, setValue, formState, handleSubmit, reset, trigger, setError } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema)
  });
  const { errors } = formState;
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);


  const onSubmit = async model => {
    axios.put('/users', model)
      .then(response => {
        props.showSuccessMessage();
        props.closeDialog();
      })
      .catch(error => {
        setErrorMessage('Nuværende adgangskode stemmer ikke overens') //Current password not correct
      })
  }

  return (
    <div style={{
      width: '300px'
    }}>
      <form className="flex flex-col justify-center w-full" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          Rediger adgangskode
        </DialogTitle>
        <DialogContent>
          <Controller
            name="old_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                className="mb-16"
                label="Gammelt adgangskode *"
                autoFocus
                type="password"
                error={!!errors.old_password}
                helperText={errors?.old_password?.message}
                InputProps={{
                  className: 'pr-2',
                  type: showOldPassword ? 'text' : 'password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                        <Icon className="text-20" color="action">
                          {showOldPassword ? 'visibility' : 'visibility_off'}
                        </Icon>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          <Controller
            name="new_password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                className="mb-16"
                label="Nyt adgangskode *"
                type="password"
                error={!!errors.new_password}
                helperText={errors?.new_password?.message}
                InputProps={{
                  className: 'pr-2',
                  type: showNewPassword ? 'text' : 'password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                        <Icon className="text-20" color="action">
                          {showNewPassword ? 'visibility' : 'visibility_off'}
                        </Icon>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
          {errorMessage && <div className="mt-10 text-center text-red-500">{errorMessage}</div>}
        </DialogContent>
        <DialogActions>
          <div className="flex justify-around">
            <Button onClick={props.closeDialog} color="secondary">
              Annuller
            </Button>
            <Button type="submit" color="primary">
              Gem
            </Button>
          </div>
        </DialogActions>
      </form>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openDialog,
      closeDialog,
      showErrorMessage,
      showSuccessMessage,
    },
    dispatch
  );
}
export default connect(null, mapDispatchToProps)(ChangePasswordForm);