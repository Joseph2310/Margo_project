import { apiClient } from '../api/apiClient';
import type { DailyReading, HomeDashboard } from '../types/business';

export const homeService = {
  async getDashboard(): Promise<HomeDashboard> {
    const response = await apiClient.get<HomeDashboard>('/home');
    return response.data;
  },

  async getDailyReading(): Promise<DailyReading | undefined> {
    const response = await apiClient.get<DailyReading | null>(
      '/readings/today',
    );
    return response.data ?? undefined;
  },
};
