
import { Icon, IconButton, TextField, } from '@material-ui/core';
import { FREE_NAME_PRODUCT_ID, } from 'app/constants';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED } from 'app/constants';
import * as yup from 'yup';
import NumberTextField from 'app/shared-components/NumberTextField';


const schema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  quantity: yup.number(MSG_REQUIRED).required(MSG_REQUIRED).min(1, MSG_REQUIRED),
  // price: yup.number().required(MSG_REQUIRED).min(0, MSG_REQUIRED)
});

export const DialogAddSpecialProduct = ({ initValue = { _id: FREE_NAME_PRODUCT_ID, name: '', quantity: 1 }, closeDialog, onSubmit }) => {
  const { control, formState, handleSubmit } = useForm({
    mode: 'onSubmit',
    defaultValues: initValue,
    resolver: yupResolver(schema)
  });
  const { errors } = formState;

  return (
    <form className='w-400' onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
      <DialogTitle className='text-center'>Fritekst</DialogTitle>
      <DialogContent>
        <Controller
          name='name'
          control={control}
          defaultValue=''
          render={({ field }) => (
            <TextField
              {...field}
              autoFocus
              className='mt-10'
              id='name'
              label='Navn *'
              fullWidth
              error={!!errors.name}
              helperText={errors?.name?.message}
            />
          )}
        />
        <Controller
          name='quantity'
          control={control}
          defaultValue='0'
          render={({ field }) => (
            <span style={{ display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '1.3rem' }}>
              <label style={{ color: 'rgb(107, 114, 128)' }}>Antal</label>
              <IconButton color='primary' onClick={() => field.onChange(field.value - 1)}>
                <Icon fontSize='small'>remove</Icon></IconButton>
              <NumberTextField
                {...field}
                style={{ width: '30px', textAlignLast: 'center' }}
                id='quantity'
                error={!!errors.quantity}
                helperText={errors?.quantity && MSG_REQUIRED}
              />
              <IconButton color='primary' onClick={() => field.onChange(field.value + 1)}>
                <Icon fontSize='small'>add</Icon></IconButton>
            </span>
          )}
        />
        {/* <Controller
            name='price'
            control={control}
            defaultValue='0'
            render={({ field }) => (
              <TextField
                {...field}
                type='number'
                className='mt-10'
                id='price'
                label='Pris'
                fullWidth
                error={!!errors.price}
                helperText={errors?.price?.message && MSG_REQUIRED}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8, color: 'rgb(107, 114, 128)' }}>{CURRENCY}</span>
                }}
              />
            )}
          /> */}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color='secondary'>Annuller</Button>
        <Button type='submit' color='primary'>Gem</Button>
      </DialogActions>
    </form>
  );
}