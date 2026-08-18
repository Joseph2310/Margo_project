import { apiClient } from '../api/apiClient';
import type { BeneficiaryProfile } from '../types/business';

export type BeneficiaryProfileUpdate = Omit<
  BeneficiaryProfile,
  'id' | 'points' | 'attendanceQrValue'
>;

export const profileService = {
  async getProfile(): Promise<BeneficiaryProfile> {
    const response = await apiClient.get<BeneficiaryProfile>('/profile');
    return response.data;
  },

  async updateProfile(
    profile: BeneficiaryProfileUpdate,
  ): Promise<BeneficiaryProfile> {
    const response = await apiClient.patch<BeneficiaryProfile>(
      '/profile',
      profile,
    );
    return response.data;
  },

  async getWhatsAppGroupUrl(): Promise<string> {
    const response = await apiClient.get<{ url: string }>(
      '/profile/whatsapp-group',
    );
    return response.data.url;
  },
};
