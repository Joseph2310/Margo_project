import { apiClient } from '../api/apiClient';
import type { MessageResponse } from '../types/api';
import type {
  Conversation,
  MarkConversationReadResponse,
  SendMessagePayload,
  SendMessageResponse,
} from '../types/business';

export const conversationsService = {
  async getConversations(search?: string): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/conversations', {
      params: search?.trim() ? { search: search.trim() } : undefined,
    });
    return response.data;
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(
      `/conversations/${conversationId}`,
    );
    return response.data;
  },

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    const response = await apiClient.post<SendMessageResponse>(
      '/conversations/messages',
      payload,
    );
    return response.data;
  },

  async markConversationRead(
    conversationId: string,
  ): Promise<MarkConversationReadResponse> {
    const response = await apiClient.post<MarkConversationReadResponse>(
      `/conversations/${conversationId}/read`,
    );
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `/conversations/${conversationId}`,
    );
    return response.data;
  },

  async blockServant(conversationId: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      `/conversations/${conversationId}/block`,
    );
    return response.data;
  },
};
