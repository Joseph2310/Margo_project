import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { chatRealtimeService } from '../../services/chatRealtimeService';
import { useAppSelector } from '../../store/hooks';
import type { Conversation, ConversationMessage } from '../../types/business';
import type {
  ChatConnectionState,
  ChatServerEvent,
} from '../../types/realtime';
import { queryKeys } from '../queryKeys';

interface RealtimeContextValue {
  connectionState: ChatConnectionState;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined,
);

const upsertMessage = (
  conversation: Conversation,
  message: ConversationMessage,
): Conversation => {
  const existing = conversation.messages.findIndex(
    item => item.id === message.id,
  );
  const messages = [...conversation.messages];
  if (existing >= 0) messages[existing] = message;
  else messages.push(message);
  return { ...conversation, messages, preview: message.content };
};

const applyRealtimeEvent = (
  event: ChatServerEvent,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (event.type === 'chat.connected') {
    queryClient.invalidateQueries({ queryKey: ['conversation'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    return;
  }
  if (event.type === 'message.created') {
    const { conversationId, message } = event.data;
    queryClient.setQueryData<Conversation>(
      queryKeys.conversation(conversationId),
      current => (current ? upsertMessage(current, message) : current),
    );
    queryClient.setQueriesData<Conversation[]>(
      { queryKey: ['conversations'] },
      current =>
        current?.map(conversation =>
          conversation.id === conversationId
            ? upsertMessage(conversation, message)
            : conversation,
        ),
    );
    return;
  }
  if (event.type === 'message.status') {
    const { conversationId, messageId, status, deliveredAt, readAt } =
      event.data;
    const update = (conversation: Conversation): Conversation => ({
      ...conversation,
      messages: conversation.messages.map(message =>
        message.id === messageId
          ? { ...message, status, deliveredAt, readAt }
          : message,
      ),
    });
    queryClient.setQueryData<Conversation>(
      queryKeys.conversation(conversationId),
      current => (current ? update(current) : current),
    );
    queryClient.setQueriesData<Conversation[]>(
      { queryKey: ['conversations'] },
      current =>
        current?.map(conversation =>
          conversation.id === conversationId
            ? update(conversation)
            : conversation,
        ),
    );
  }
};

export function ConversationsRealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const accessToken = useAppSelector(state => state.auth.accessToken);
  const [connectionState, setConnectionState] = useState<ChatConnectionState>(
    chatRealtimeService.getState(),
  );

  useEffect(() => {
    const unsubscribeState =
      chatRealtimeService.subscribeToState(setConnectionState);
    const unsubscribeEvents = chatRealtimeService.subscribe(event =>
      applyRealtimeEvent(event, queryClient),
    );

    const connectIfActive = () => {
      if (
        isAuthenticated &&
        accessToken &&
        AppState.currentState === 'active'
      ) {
        chatRealtimeService.connect(accessToken);
      }
    };
    connectIfActive();
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') connectIfActive();
      else chatRealtimeService.disconnect();
    });

    if (!isAuthenticated || !accessToken) chatRealtimeService.disconnect();
    return () => {
      appStateSubscription.remove();
      unsubscribeEvents();
      unsubscribeState();
      chatRealtimeService.disconnect();
    };
  }, [accessToken, isAuthenticated, queryClient]);

  const value = useMemo(
    () => ({
      connectionState,
      reconnect: () => chatRealtimeService.reconnect(),
    }),
    [connectionState],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useChatRealtime = (): RealtimeContextValue => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error(
      'useChatRealtime must be used inside ConversationsRealtimeProvider',
    );
  }
  return context;
};
