import { useState, useRef, useEffect } from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NumberTextField from 'app/shared-components/NumberTextField';
import { MSG_REQUIRED } from 'app/constants';

import * as yup from 'yup';

const schema = yup.object().shape({
  zip_code: yup.number().required(MSG_REQUIRED),
  municipality_id: yup.number().required(MSG_REQUIRED),
  city_id: yup.number().required(MSG_REQUIRED)
});

const ZipCodeForm = props => {
  let municipality = useRef(props.dataItem.municipality);
  let city = useRef(props.dataItem.city);
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: props.dataItem,
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const onSubmit = data => {
    data = {
      ...data,
      municipality_name: municipality.current.name,
      municipality: municipality.current,
      city: city.current,
      city_name: city.current.name
    };
    props.onSubmit(data);
  };

  return (
    <form className="w-400" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
      <DialogTitle className="text-center">{props.dataItem._id ? 'Opdater postnummer' : 'Opret postnummer'}</DialogTitle>
      <DialogContent>
        <Controller
          name="zip_code"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <NumberTextField
              {...field}
              className="mt-10"
              id="name"
              label="Postnummer *"
              fullWidth
              error={!!errors.zip_code}
              helperText={errors?.zip_code?.message}
            />
          )}
        />
        <Controller
          name="city_id"
          control={control}
          render={({ field }) => (
            <div className="mt-10">
              <Autocomplete
                id="city_id"
                disableClearable
                options={props.cityList}
                getOptionLabel={option => option.name}
                getOptionSelected={(option, value) => option._id === value._id}
                value={city.current}
                defaultValue={props.dataItem.city}
                renderInput={params => (
                  <TextField {...params} label="By *" fullWidth error={!!errors.city_id} helperText={errors.city_id && MSG_REQUIRED} />
                )}
                onChange={(_, value) => {
                  city.current = value;
                  field.onChange(value._id);
                }}
              />
            </div>
          )}
        />
        <Controller
          name="municipality_id"
          control={control}
          render={({ field }) => (
            <div className="mt-10">
              <Autocomplete
                style={{ width: '100%' }}
                id="municipality_id"
                disableClearable
                options={props.municipalityList}
                getOptionLabel={option => option.name}
                getOptionSelected={(option, value) => option._id === value._id}
                value={municipality.current}
                defaultValue={props.dataItem.municipality}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Kommune *"
                    fullWidth
                    error={!!errors.municipality_id}
                    helperText={errors.municipality_id && MSG_REQUIRED}
                  />
                )}
                onChange={(_, value) => {
                  municipality.current = value;
                  field.onChange(value._id);
                }}
              />
            </div>
          )}
        />
      </DialogContent>
      <CommandInForm {...props} removeTitle={`Vil du slette ${props.dataItem.zip_code} ${props.dataItem.city_name}`} />
    </form>
  );
};

export default ZipCodeForm;
