import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/tokens';
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../../providers/NotificationsProvider/hooks';
import { QueryState } from '../../components/feedback/QueryState';
import { useLocalization } from '../../localization';

export function NotificationsScreen() {
  const { t } = useLocalization();
  const notifications = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  return (
    <Screen scroll={false}>
      <AppHeader title={t('more.notifications')} />
      <QueryState
        loading={notifications.isLoading}
        error={notifications.isError}
        onRetry={() => notifications.refetch()}
      />
      {notifications.data?.map(notification => (
        <Pressable
          key={notification.id}
          className={`mb-3 rounded-card p-4 ${notification.isRead ? 'bg-white' : 'bg-primary-soft'}`}
          onPress={() => markRead.mutate(notification.id)}>
          <AppText className="font-bold">{notification.title}</AppText>
          <AppText className="mt-1 text-body text-muted">
            {notification.body}
          </AppText>
        </Pressable>
      ))}
      {!notifications.isLoading && !notifications.data?.length ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="notifications-outline"
            size={58}
            color={colors.muted}
          />
          <AppText align="center" className="mt-4 text-body text-muted">
            {t('notifications.empty')}
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}
