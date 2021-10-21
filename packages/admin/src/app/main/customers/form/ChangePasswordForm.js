import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { Controller, useForm } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { MSG_REQUIRED } from 'app/constants';
import * as yup from 'yup';

const schema = yup.object().shape({
  password: yup.string().required(MSG_REQUIRED),
});

const ChangePasswordForm = props => {
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      ...props.customer,
      username: props.customer.username ?? '',
      password: props.customer.password ?? '',
    },
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  return (
    <div>
      <form className="w-400" onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
        <DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
          Skift adgangskode
        </DialogTitle>
        <DialogContent>
          {Array.isArray(props.customer.phone) && (
            <div>
              <label style={{ lineHeight: '2.5em' }}>Telefon:</label>
              {props.customer.phone.map(x => {
                return (
                  <Button
                    key={x}
                    type="button"
                    color="primary"
                    onClick={() => {
                      reset({
                        ...props.customer,
                        username: `p${x}`,
                        password: x,
                      });
                    }}>
                    {' '}
                    {x}
                  </Button>
                );
              })}
            </div>
          )}
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                id="username"
                label="Username"
                fullWidth
                autoFocus
                error={!!errors.username}
                helperText={errors?.username?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                id="password"
                label="Adgangskode *"
                fullWidth
                className="mt-10"
                error={!!errors.password}
                helperText={errors?.password?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.closeDialog()} color="secondary">
            Annuller
          </Button>
          {/* type=submit => onCLick submit form*/}
          <Button type="submit" color="primary">
            Gem
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};
export default ChangePasswordForm;
