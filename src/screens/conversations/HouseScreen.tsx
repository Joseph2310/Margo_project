import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { ChurchBackdrop } from '../../components/ChurchBackdrop';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { QueryState } from '../../components/feedback/QueryState';
import { useConversationsQuery } from '../../hooks/useDesignContent';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';

export function HouseScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const conversations = useConversationsQuery();
  return (
    <Screen scroll={false} padded={false} bottomInset={false}>
      <View className="absolute inset-0">
        <ChurchBackdrop />
      </View>
      <View className="flex-1 px-5 pt-2">
        <AppText align="center" className="mb-5 text-title font-bold">
          البيت
        </AppText>
        <View className="mb-3 h-12 flex-row-reverse items-center rounded-full bg-white px-4">
          <Ionicons name="search-outline" size={21} color={colors.primary} />
          <TextInput
            className="flex-1 px-3 text-right text-ink"
            placeholder="بحث عن المحادثات"
            placeholderTextColor={colors.muted}
          />
        </View>
        <QueryState
          loading={conversations.isLoading}
          error={conversations.isError}
          onRetry={() => conversations.refetch()}
        />
        {conversations.data?.map(conversation => (
          <Pressable
            key={conversation.id}
            className="mb-1 flex-row-reverse items-center border-b border-line/50 py-3"
            onPress={() =>
              navigation.navigate('Chat', { conversationId: conversation.id })
            }>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-rose">
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View className="mr-3 flex-1">
              <AppText className="text-label font-medium">
                {conversation.servantName}
              </AppText>
              <AppText numberOfLines={1} className="text-small text-muted">
                {conversation.preview}
              </AppText>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert(conversation.servantName, undefined, [
                  {
                    text: `حظر ${conversation.servantName}`,
                    style: 'destructive',
                  },
                  { text: 'إزالة المحادثة', style: 'destructive' },
                  { text: 'إلغاء', style: 'cancel' },
                ])
              }>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </Pressable>
        ))}
        {!conversations.isLoading && !conversations.data?.length ? (
          <View className="flex-1 items-center justify-center px-10">
            <AppText
              align="center"
              className="text-hero leading-[44px] text-primary">
              إبدأ محادثتك او استفساراتك مع خادمات مدارس الاحد الان
            </AppText>
          </View>
        ) : null}
        <Pressable
          className="mb-5 mt-auto items-center self-start"
          onPress={() =>
            navigation.navigate('Chat', { conversationId: 'all' })
          }>
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Ionicons
              name="chatbox-ellipses-outline"
              size={28}
              color={colors.surface}
            />
          </View>
          <AppText align="center" className="text-small mt-1 text-primary">
            المحادثة مع{`\n`}الجميع
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
