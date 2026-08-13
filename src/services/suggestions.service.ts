import type { SuggestionPayload } from '../types/business';

export interface SuggestionsService {
  submitSuggestion(payload: SuggestionPayload): Promise<void>;
}
