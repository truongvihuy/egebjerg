import { createSlice } from '@reduxjs/toolkit';
import history from '@history';
import _ from '@lodash';
import { setInitialSettings, setDefaultSettings } from 'app/store/fuse/settingsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import authService from 'app/services/authService';
import { MSG_USER_DATA_SAVED_WITH_API } from 'app/constants';

export const setUserData = user => async (dispatch, getState) => {
	if (user.permission) {
		for (const key in user.permission) {
			user.permission[key] = parseInt(user.permission[key], 2);
		}
	}

	/*
      You can redirect the logged-in user to a specific route depending on his role
       */
	history.location.state = {
		redirectUrl: '/dashboard' // for example 'apps/academy'
	};

	/*
    Set User Settings
     */
	dispatch(setDefaultSettings(user.settings ?? null));

	dispatch(setUser(user));
};

export const updateUserSettings = settings => async (dispatch, getState) => {
	const oldUser = getState().auth.user;
	const user = _.merge({}, oldUser, { data: { settings } });

	dispatch(updateUserData(user));

	return dispatch(setUserData(user));
};

export const updateUserShortcuts = shortcuts => async (dispatch, getState) => {
	const { user } = getState().auth;
	const newUser = {
		...user,
		data: {
			...user.data,
			shortcuts
		}
	};

	dispatch(updateUserData(user));

	return dispatch(setUserData(newUser));
};

export const logoutUser = () => async (dispatch, getState) => {
	const { user } = getState().auth;

	if (!user) {
		// is guest
		return null;
	}

	history.push({
		pathname: '/'
	});

	switch (user.from) {
		default: {
			authService.logout();
		}
	}

	dispatch(setInitialSettings());

	return dispatch(userLoggedOut());
};

export const updateUserData = user => async (dispatch, getState) => {
	if (!user.role || user.role.length === 0) {
		// is guest
		return;
	}
	switch (user.from) {
		default: {
			authService
				.updateUserData(user)
				.then(() => {
					dispatch(showMessage({ message: MSG_USER_DATA_SAVED_WITH_API }));
				})
				.catch(error => {
					dispatch(showMessage({ message: error.message }));
				});
			break;
		}
	}
};

const initialState = {};

const userSlice = createSlice({
	name: 'auth/user',
	initialState,
	reducers: {
		setUser: (state, action) => action.payload,
		userLoggedOut: (state, action) => initialState
	},
	extraReducers: {}
});

export const { setUser, userLoggedOut } = userSlice.actions;

export default userSlice.reducer;
