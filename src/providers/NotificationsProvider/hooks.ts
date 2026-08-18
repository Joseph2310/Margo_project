import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../../services/notificationsService';
import { queryKeys } from '../queryKeys';

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsService.getNotifications,
  });

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};
