import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert } from 'react-native';
import { View } from 'react-native';
import { ChurchBackdrop } from '../../components/ChurchBackdrop';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { MessageComposer } from '../../components/forms/MessageComposer';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/tokens';
import {
  useConversationQuery,
  useSendMessageMutation,
} from '../../providers/ConversationsProvider/hooks';
import { QueryState } from '../../components/feedback/QueryState';
import { getApiErrorMessage } from '../../api/errors';
import { useProfileQuery } from '../../providers/ProfileProvider/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const conversation = useConversationQuery(route.params.conversationId);
  const sendMessage = useSendMessageMutation(route.params.conversationId);
  const profile = useProfileQuery();
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(
    route.params.conversationId === 'all',
  );
  const send = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        conversationId: route.params.conversationId,
        content: message.trim(),
        kind: 'text',
        anonymous,
      });
      setMessage('');
    } catch (error) {
      Alert.alert('تعذر إرسال الرسالة', getApiErrorMessage(error));
    }
  };
  return (
    <Screen scroll={false} padded={false}>
      <View className="absolute inset-0">
        <ChurchBackdrop />
      </View>
      <View className="flex-1">
        <View className="px-5">
          <AppHeader title="البيت" />
        </View>
        <View className="flex-1 px-5">
          <QueryState
            loading={conversation.isLoading}
            error={conversation.isError}
            onRetry={() => conversation.refetch()}
          />
          {!conversation.isLoading && !conversation.data?.messages.length ? (
            <View className="flex-1 items-center justify-center px-8">
              <AppText
                align="center"
                className="text-hero leading-[44px] text-primary">
                إبدأ محادثتك او استفساراتك مع خادمات مدارس الاحد الان
              </AppText>
            </View>
          ) : (
            <View className="gap-5">
              {conversation.data?.messages.map(item => {
                const mine = item.sender === 'beneficiary';
                return (
                  <View
                    key={item.id}
                    className={mine ? 'items-end' : 'items-start'}>
                    <View className="mb-1 flex-row-reverse items-center gap-2">
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-rose">
                        <Ionicons
                          name="person"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                      <AppText className="text-caption">
                        {item.senderName}
                      </AppText>
                    </View>
                    <View
                      className={`max-w-[78%] rounded-xl px-4 py-3 ${mine ? 'bg-primary' : 'bg-primary-soft'}`}>
                      <AppText className={mine ? 'text-white' : 'text-ink'}>
                        {item.content}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
