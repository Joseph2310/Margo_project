import { apiClient } from '../api/apiClient';
import type { MessageResponse } from '../types/api';
import type { NotificationItem } from '../types/business';

export const notificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await apiClient.get<NotificationItem[]>('/notifications');
    return response.data;
  },

  async markRead(notificationId: string): Promise<NotificationItem> {
    const response = await apiClient.patch<NotificationItem>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  async markAllRead(): Promise<MessageResponse> {
    const response = await apiClient.patch<MessageResponse>(
      '/notifications/read-all',
    );
    return response.data;
  },
};
