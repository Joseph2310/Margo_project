import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsService } from '../../services/conversationsService';
import { queryKeys } from '../queryKeys';

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

export const useSendMessageMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: conversationsService.sendMessage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.conversation(conversationId),
        }),
        queryClient.invalidateQueries({ queryKey: ['conversations'] }),
      ]);
    },
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
