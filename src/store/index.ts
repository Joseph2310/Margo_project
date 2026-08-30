import { configureStore } from '@reduxjs/toolkit';
import { authReducer, initialAuthState, type AuthState } from './authSlice';
import { persistentStorage } from './storage';
import { initialUiState, uiReducer, type UiState } from './uiSlice';
import { configureNativeDirection } from '../utils/rtl';
import type { Language } from '../localization';

const persistedAuth = persistentStorage.getJson<AuthState>('auth');
const persistedUi = persistentStorage.getJson<Partial<UiState>>('ui');
const initialLanguage: Language = persistedUi?.language === 'en' ? 'en' : 'ar';
configureNativeDirection(initialLanguage);
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  preloadedState: {
    auth: persistedAuth
      ? { ...persistedAuth, hasCompletedSplash: false }
      : initialAuthState,
    ui: { ...initialUiState, ...persistedUi, language: initialLanguage },
  },
});

store.subscribe(() => {
  const state = store.getState();
  persistentStorage.setJson('auth', state.auth);
  persistentStorage.setJson('ui', state.ui);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
