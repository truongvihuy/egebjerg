import React, { useState } from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import CommandInForm from 'app/kendo/CommandInForm';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { MSG_REQUIRED, USER_GROUP_STORE } from 'app/constants';
import * as yup from 'yup';

const EditForm = props => {
	const schema = props.isEdit ? yup.object().shape({
		username: yup.string().required(MSG_REQUIRED),
		name: yup.string().required(MSG_REQUIRED),
		user_group_id: yup.number().required(MSG_REQUIRED),
		store_id: yup.mixed().when('user_group_id', {
			is: USER_GROUP_STORE,
			then: yup.number().required(MSG_REQUIRED),
		}),
	}) : yup.object().shape({
		username: yup.string().required(MSG_REQUIRED),
		password: yup.string().required(MSG_REQUIRED),
		name: yup.string().required(MSG_REQUIRED),
		user_group_id: yup.number().required(MSG_REQUIRED),
		store_id: yup.mixed().when('user_group_id', {
			is: USER_GROUP_STORE,
			then: yup.number().required(MSG_REQUIRED),
		}),
	});
	// const [itemModel, setItemModel] = useState(null);
	const { control, setValue, formState, handleSubmit, reset, trigger, setError, watch } = useForm({
		mode: 'onSubmit',
		defaultValues: props.dataItem,
		resolver: yupResolver(schema),
	});
	const item = watch();

	const { errors } = formState;

	/*   const handleSelectUserGroup = event => {
			setItemModel({ ...itemModel, user_group_id: event.target.value });
		}; */

	return (
		<form className="w-400" onSubmit={handleSubmit(props.onSubmit)} noValidate autoComplete="off">
			<DialogTitle className="text-center">{props.dataItem._id ? 'Opdater bruger' : 'Opret bruger'}</DialogTitle>
			<DialogContent>
				<Controller
					name="user_group_id"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							id="user_group_id"
							label="Gruppe *"
							select
							fullWidth
							error={!!errors.user_group_id}
							helperText={errors?.user_group_id?.message}>
							{props.dataItem.userGroupList.map(option => (
								<MenuItem key={option._id} value={option._id}>
									{option.name}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							className="mt-10"
							id="name"
							label="Navn *"
							fullWidth
							error={!!errors.name}
							autoFocus
							helperText={errors?.name?.message}
						/>
					)}
				/>
				<Controller
					name="username"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							className="mt-10"
							id="username"
							label="Brugernavn *"
							fullWidth
							error={!!errors.username}
							helperText={errors?.username?.message}
						/>
					)}
				/>
				{props.isEdit ? null : (
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mt-10"
								id="password"
								label="Adgangskode *"
								type="password"
								fullWidth
								error={!!errors.password}
								helperText={errors?.password?.message}
							/>
						)}
					/>
				)}
				{item.user_group_id == USER_GROUP_STORE && (
					<Controller
						name="store_id"
						control={control}
						render={({ field }) => {
							return (
								<div>
									<TextField
										style={{ width: 200 }}
										label="Butik *"
										value={field.value}
										className="mt-10"
										select
										onChange={e => {
											field.onChange(e.target.value);
										}}
										error={!!errors.store_id}
										helperText={errors?.store_id?.message}
									>
										{props.storeList.map(x => {
											return (
												<MenuItem key={x._id} value={x._id}>
													{x.name}
												</MenuItem>
											);
										})}
									</TextField>
								</div>
							);
						}}
					/>
				)}
				<Controller
					name="active"
					control={control}
					render={({ field }) => {
						return (
							<FormControlLabel
								className="mt-10"
								control={<Checkbox color="primary" onChange={field.onChange} checked={field.value} />}
								label="Aktiv"
							/>
						);
					}}
				/>
			</DialogContent>
			<CommandInForm {...props} />
		</form>
	);
};

export default EditForm;
