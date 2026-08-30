import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, View } from 'react-native';
import { colors } from '../theme/tokens';
import { AppText } from './AppText';
import { useLocalization } from '../localization';

interface Props {
  title: string;
  showBack?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function AppHeader({
  title,
  showBack = true,
  actionLabel,
  onAction,
}: Props) {
  const navigation = useNavigation();
  const { isRTL, t } = useLocalization();
  return (
    <View
      className={`mb-6 mt-2 h-14 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <View className="w-14 items-center">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="h-12 w-14 items-center justify-center rounded-lg bg-primary-soft"
            onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        ) : null}
      </View>
      <AppText align="center" className="text-title font-medium">
        {title}
      </AppText>
      <View className="w-14 items-center">
        {actionLabel ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
            <AppText className="text-small text-primary">{actionLabel}</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
