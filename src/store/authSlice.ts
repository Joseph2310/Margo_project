import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession } from '../types/auth';

export interface AuthState extends AuthSession {
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
    signIn(state, action: PayloadAction<Pick<AuthSession, 'beneficiaryId'>>) {
      state.isAuthenticated = true;
      state.beneficiaryId = action.payload.beneficiaryId;
    },
    signOut(state) {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      state.beneficiaryId = undefined;
    },
  },
});

export const { completeSplash, signIn, signOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
