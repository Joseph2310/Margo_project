import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { retreatService } from '../../services/retreatService';
import { queryKeys } from '../queryKeys';

export const useActivitiesQuery = () =>
  useQuery({
    queryKey: queryKeys.activities,
    queryFn: retreatService.getActivities,
  });

export const useRetreatSubmissionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retreatService.submit,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home }),
      ]);
    },
  });
};

export const useReflectionQuery = () =>
  useQuery({
    queryKey: queryKeys.reflection,
    queryFn: retreatService.getLatestReflection,
  });

export const useCompleteReflectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retreatService.completeReflection,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reflection }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home }),
      ]);
    },
  });
};
