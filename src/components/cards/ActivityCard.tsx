import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, View } from 'react-native';
import type { SpiritualActivity } from '../../types/business';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';
import { useLocalization } from '../../localization';

interface Props {
  activity: SpiritualActivity;
  checked: boolean;
  onToggle: () => void;
}

export function ActivityCard({ activity, checked, onToggle }: Props) {
  const { isRTL, t, formatNumber } = useLocalization();
  return (
    <Pressable
      className={`mb-4 items-start gap-3 rounded-card bg-white p-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
      style={shadows.card}
      onPress={onToggle}>
      <View className="flex-1">
        <AppText className="text-label font-medium">{activity.title}</AppText>
        {activity.points ? (
          <AppText className="mt-1 text-caption text-muted">
            🪙 {t('common.points', { count: formatNumber(activity.points) })}
          </AppText>
        ) : null}
        {activity.description ? (
          <AppText className="mt-4 text-body font-medium">
            {activity.description}
          </AppText>
        ) : null}
      </View>
      <View className="pt-1">
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={27}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
}
