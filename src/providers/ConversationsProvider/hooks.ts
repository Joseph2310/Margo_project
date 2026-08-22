import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsService } from '../../services/conversationsService';
import { queryKeys } from '../queryKeys';
import type { Conversation } from '../../types/business';

export const useConversationsQuery = (search = '') =>
  useQuery({
    queryKey: queryKeys.conversations(search),
    queryFn: () => conversationsService.getConversations(search),
  });

export const useConversationQuery = (conversationId: string) =>
  useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: () => conversationsService.getConversation(conversationId),
    enabled: Boolean(conversationId),
  });

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsService.sendMessage,
    onSuccess: async response => {
      queryClient.setQueryData<Conversation>(
        queryKeys.conversation(response.conversationId),
        current => {
          if (!current) return current;
          const messages = current.messages.some(
            message => message.id === response.message.id,
          )
            ? current.messages.map(message =>
                message.id === response.message.id ? response.message : message,
              )
            : [...current.messages, response.message];
          return { ...current, messages, preview: response.message.content };
        },
      );
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkConversationReadMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationsService.markConversationRead(conversationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation(conversationId),
      }),
  });
};

export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsService.deleteConversation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};

export const useBlockConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsService.blockServant,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
};
