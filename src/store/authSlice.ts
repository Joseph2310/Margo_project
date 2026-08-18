import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession } from '../types/auth';

export interface AuthState extends Partial<
  Omit<AuthSession, 'isAuthenticated'>
> {
  isAuthenticated: boolean;
  hasCompletedSplash: boolean;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  hasCompletedSplash: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    completeSplash(state) {
      state.hasCompletedSplash = true;
    },
    signIn(state, action: PayloadAction<AuthSession>) {
      Object.assign(state, action.payload);
    },
    signOut(state) {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.tokenType = undefined;
      state.expiresIn = undefined;
      state.beneficiaryId = undefined;
    },
  },
});

export const { completeSplash, signIn, signOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
