import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { getApiErrorMessage } from '../../api/errors';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { ChurchBackdrop } from '../../components/ChurchBackdrop';
import { QueryState } from '../../components/feedback/QueryState';
import { MessageComposer } from '../../components/forms/MessageComposer';
import { Screen } from '../../components/Screen';
import {
  useConversationQuery,
  useMarkConversationReadMutation,
  useSendMessageMutation,
} from '../../providers/ConversationsProvider/hooks';
import { useChatRealtime } from '../../providers/ConversationsProvider/RealtimeProvider';
import { useProfileQuery } from '../../providers/ProfileProvider/hooks';
import { colors } from '../../theme/tokens';
import type { ConversationMessage } from '../../types/business';
import type { RootStackParamList } from '../../types/navigation';
import { formatMessageTime } from '../../utils/format';
import { useLocalization, type TranslationKey } from '../../localization';
import type { ChatConnectionState } from '../../types/realtime';
import type { MessageDeliveryStatus } from '../../types/business';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const connectionLabel: Record<ChatConnectionState, TranslationKey> = {
  connected: 'chat.connected',
  connecting: 'chat.connecting',
  reconnecting: 'chat.reconnecting',
  disconnected: 'chat.disconnected',
  error: 'chat.connectionError',
};

const deliveryLabel: Record<MessageDeliveryStatus, TranslationKey> = {
  sent: 'chat.sent',
  delivered: 'chat.delivered',
  read: 'chat.read',
};

export function ChatScreen({ route }: Props) {
  const { isRTL, language, t } = useLocalization();
  const conversationId = route.params.conversationId;
  const conversation = useConversationQuery(conversationId);
  const sendMessage = useSendMessageMutation();
  const markRead = useMarkConversationReadMutation(conversationId);
  const profile = useProfileQuery();
  const { connectionState, reconnect } = useChatRealtime();
  const listRef = useRef<FlatList<ConversationMessage>>(null);
  const requestedReadIds = useRef('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(conversationId === 'all');

  const unreadIds =
    conversation.data?.messages
      .filter(item => !item.isMine && item.status !== 'read')
      .map(item => item.id)
      .join(',') ?? '';

  useEffect(() => {
    if (!unreadIds || requestedReadIds.current === unreadIds) return;
    requestedReadIds.current = unreadIds;
    markRead.mutate(undefined, {
      onError: () => {
        requestedReadIds.current = '';
      },
    });
  }, [markRead, unreadIds]);

  const send = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: message.trim(),
        kind: 'text',
        anonymous,
      });
      setMessage('');
    } catch (error) {
      Alert.alert(t('chat.sendError'), getApiErrorMessage(error, t));
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => (
    <View className={`mb-5 ${item.isMine ? 'items-end' : 'items-start'}`}>
      <View
        className={`mb-1 items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-rose">
          <Ionicons name="person" size={16} color={colors.primary} />
        </View>
        <AppText className="text-caption">
          {item.isAnonymous ? t('chat.anonymous') : item.senderName}
        </AppText>
      </View>
      <View
        className={`max-w-[78%] rounded-xl px-4 py-3 ${
          item.isMine ? 'bg-primary' : 'bg-primary-soft'
        }`}>
        <AppText className={item.isMine ? 'text-white' : 'text-ink'}>
          {item.content}
        </AppText>
        <View
          className={`mt-1 items-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <AppText
            className={`text-[10px] ${
              item.isMine ? 'text-white/75' : 'text-muted'
            }`}>
            {formatMessageTime(item.createdAt, language)}
          </AppText>
          {item.isMine ? (
            <>
              <Ionicons
                name={item.status === 'sent' ? 'checkmark' : 'checkmark-done'}
                size={13}
                color={item.status === 'read' ? '#D9F8FF' : '#FFFFFF'}
              />
              <AppText className="text-[10px] text-white/75">
                {t(deliveryLabel[item.status])}
              </AppText>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <Screen scroll={false} padded={false}>
      <View className="absolute inset-0">
        <ChurchBackdrop />
      </View>
      <View className="flex-1">
        <View className="px-5">
          <AppHeader title={t('tabs.house')} />
          <Pressable
            disabled={connectionState === 'connected'}
            onPress={reconnect}
            className={`mb-2 items-center justify-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <View
              className={`h-2 w-2 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-green-600'
                  : 'bg-amber-500'
              }`}
            />
            <AppText className="text-caption text-muted">
              {t(connectionLabel[connectionState])}
            </AppText>
          </Pressable>
        </View>
        <View className="flex-1 px-5">
          <QueryState
            loading={conversation.isLoading}
            error={conversation.isError}
            onRetry={() => conversation.refetch()}
          />
          {!conversation.isLoading && !conversation.isError ? (
            <FlatList
              ref={listRef}
              data={conversation.data?.messages ?? []}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="flex-grow py-3"
              onContentSizeChange={() =>
                listRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center px-8">
                  <AppText
                    align="center"
                    className="text-hero leading-[44px] text-primary">
                    {t('chat.empty')}
                  </AppText>
                </View>
              }
            />
          ) : null}
        </View>
        <MessageComposer
          value={message}
          anonymous={anonymous}
          senderName={profile.data?.name}
          sending={sendMessage.isPending}
          onChangeText={setMessage}
          onIdentityChange={setAnonymous}
          onSend={send}
        />
      </View>
    </Screen>
  );
}
