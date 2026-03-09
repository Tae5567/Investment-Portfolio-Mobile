// UI slice for managing UI state in the Redux store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types';

const initialState: UIState = {
  isDarkMode: true, // Default to dark mode
  hideBalances: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleHideBalances: (state) => {
      state.hideBalances = !state.hideBalances;
    },
  },
});

export const { toggleDarkMode, toggleHideBalances } = uiSlice.actions;
export default uiSlice.reducer;