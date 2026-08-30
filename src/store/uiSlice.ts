import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../localization';

export interface UiState {
  notice?: string;
  language: Language;
}

export const initialUiState: UiState = { language: 'ar' };

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    showNotice(state, action: PayloadAction<string>) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = undefined;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { showNotice, clearNotice, setLanguage } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
