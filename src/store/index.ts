import { configureStore } from '@reduxjs/toolkit';
import { profileFixture } from '../constants/business';
import { authReducer, initialAuthState, type AuthState } from './authSlice';
import { profileReducer, type ProfileState } from './profileSlice';
import { persistentStorage } from './storage';
import { uiReducer } from './uiSlice';

const persistedAuth = persistentStorage.getJson<AuthState>('auth');
const persistedProfile = persistentStorage.getJson<ProfileState>('profile');

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    ui: uiReducer,
  },
  preloadedState: {
    auth: persistedAuth ?? initialAuthState,
    profile: persistedProfile ?? { beneficiary: profileFixture },
  },
});

store.subscribe(() => {
  const state = store.getState();
  persistentStorage.setJson('auth', state.auth);
  persistentStorage.setJson('profile', state.profile);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
