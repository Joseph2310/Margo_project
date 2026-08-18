import { useMutation } from '@tanstack/react-query';
import { suggestionsService } from '../../services/suggestionsService';

export const useSuggestionMutation = () =>
  useMutation({ mutationFn: suggestionsService.submitSuggestion });
