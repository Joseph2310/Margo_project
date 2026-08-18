import { configureStore } from '@reduxjs/toolkit';
import { authReducer, initialAuthState, type AuthState } from './authSlice';
import { persistentStorage } from './storage';
import { uiReducer } from './uiSlice';

const persistedAuth = persistentStorage.getJson<AuthState>('auth');
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  preloadedState: {
    auth: persistedAuth
      ? { ...persistedAuth, hasCompletedSplash: false }
      : initialAuthState,
  },
});

store.subscribe(() => {
  const state = store.getState();
  persistentStorage.setJson('auth', state.auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
