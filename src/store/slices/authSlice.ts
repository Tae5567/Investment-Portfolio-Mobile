// Authentication slice for managing user state in the Redux store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  biometricEnabled: true,
  isLoading: false,
};

// Mock user data
const MOCK_USER: User = {
  id: 'USR-001',
  name: 'Chidi Okonkwo',
  email: 'chidi.okonkwo@email.com',
  phone: '+234 801 234 5678',
  accountNumber: '0123456789',
  kycStatus: 'verified',
  avatarInitials: 'CO',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state) => {
      state.user = MOCK_USER;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
  },
});

export const { loginSuccess, logout, setLoading, setBiometricEnabled } = authSlice.actions;
export default authSlice.reducer;