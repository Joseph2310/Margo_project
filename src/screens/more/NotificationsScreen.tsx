import Ionicons from '@react-native-vector-icons/ionicons';
import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/tokens';

export function NotificationsScreen() {
  return (
    <Screen scroll={false}>
      <AppHeader title="الإشعارات" />
      <View className="flex-1 items-center justify-center">
        <Ionicons name="notifications-outline" size={58} color={colors.muted} />
        <AppText align="center" className="mt-4 text-body text-muted">
          لا توجد إشعارات
        </AppText>
      </View>
    </Screen>
  );
}
