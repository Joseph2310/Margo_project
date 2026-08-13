import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, View } from 'react-native';
import type { SpiritualActivity } from '../../types/business';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';

interface Props {
  activity: SpiritualActivity;
  checked: boolean;
  onToggle: () => void;
}

export function ActivityCard({ activity, checked, onToggle }: Props) {
  return (
    <Pressable
      className="mb-4 flex-row-reverse items-start rounded-card bg-white p-4"
      style={shadows.card}
      onPress={onToggle}>
      <View className="mr-auto pt-1">
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={27}
          color={colors.primary}
        />
      </View>
      <View className="flex-1">
        <AppText className="text-label font-medium">{activity.title}</AppText>
        {activity.points ? (
          <AppText className="mt-1 text-caption text-muted">
            🪙 {activity.points} نقطة
          </AppText>
        ) : null}
        {activity.description ? (
          <AppText className="mt-4 text-body font-medium">
            {activity.description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
