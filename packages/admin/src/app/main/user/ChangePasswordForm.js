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
	password: yup.string().required(MSG_REQUIRED)
});

const ChangePasswordForm = props => {
	const { control, setValue, formState, handleSubmit, reset, trigger, setError } = useForm({
		mode: 'onChange',
		itemModel: props.user,
		resolver: yupResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	return (
		<div>
			<form className="w-400" onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
				<DialogTitle id="alert-dialog-title" style={{ textAlign: 'center' }}>
					Skift adgangskode
				</DialogTitle>
				<DialogContent>
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								type="password"
								id="password"
								label="Adgangskode *"
								fullWidth
								autoFocus
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
