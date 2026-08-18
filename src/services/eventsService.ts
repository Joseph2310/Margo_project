import { apiClient } from '../api/apiClient';
import type { BeneficiaryEvent } from '../types/business';

export const eventsService = {
  async getUpcomingEvents(fromDate?: string): Promise<BeneficiaryEvent[]> {
    const response = await apiClient.get<BeneficiaryEvent[]>('/events', {
      params: fromDate ? { fromDate } : undefined,
    });
    return response.data;
  },
};
