import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { profileFixture } from '../constants/business';
import type { BeneficiaryProfile } from '../types/business';

export interface ProfileState {
  beneficiary: BeneficiaryProfile;
}

const initialState: ProfileState = { beneficiary: profileFixture };

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<BeneficiaryProfile>) {
      state.beneficiary = action.payload;
    },
  },
});

export const { updateProfile } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
