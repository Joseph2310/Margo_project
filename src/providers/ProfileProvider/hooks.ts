import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/profileService';
import { queryKeys } from '../queryKeys';

export const useProfileQuery = () =>
  useQuery({ queryKey: queryKeys.profile, queryFn: profileService.getProfile });

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: profile => {
      queryClient.setQueryData(queryKeys.profile, profile);
      return queryClient.invalidateQueries({ queryKey: queryKeys.home });
    },
  });
};

export const useWhatsAppGroupMutation = () =>
  useMutation({ mutationFn: profileService.getWhatsAppGroupUrl });
