import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  state: null,
  options: {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
    autoHideDuration: 6000,
    message: 'Hi',
    variant: null,
  },
};
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    showMessage: (state, action) => {
      state.state = true;
      state.options = {
        ...initialState.options,
        ...action.payload,
      };
    },
    hideMessage: (state, action) => {
      state.state = null;
    },
    showSuccessMessage: (state, action) => {
      state.state = true;
      state.options = {
        ...initialState.options,
        message: action.payload || 'Vellykket!',
        variant: 'success',
      };
    },
    showErrorMessage: (state, action) => {
      state.state = true;
      state.options = {
        ...initialState.options,
        variant: 'error',
        message: action.payload || 'Fejl!',
      };
    },
    showLoadingMessage: (state, action) => {
      state.state = true;
      state.options = {
        ...initialState.options,
        variant: 'info',
        message: action.payload || 'Indlæser!',
      };
    }
  }
});

export const { hideMessage, showMessage, showSuccessMessage, showErrorMessage, showLoadingMessage } = messageSlice.actions;

export default messageSlice.reducer;
