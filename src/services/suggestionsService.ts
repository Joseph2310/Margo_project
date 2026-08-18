import { apiClient } from '../api/apiClient';
import type { SuggestionPayload, SuggestionResponse } from '../types/business';

export const suggestionsService = {
  async submitSuggestion(
    payload: SuggestionPayload,
  ): Promise<SuggestionResponse> {
    const response = await apiClient.post<SuggestionResponse>(
      '/suggestions',
      payload,
    );
    return response.data;
  },
};
