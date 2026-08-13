import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  notice?: string;
}

const initialState: UiState = {};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotice(state, action: PayloadAction<string>) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = undefined;
    },
  },
});

export const { showNotice, clearNotice } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
