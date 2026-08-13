import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { View } from 'react-native';
import type { BeneficiaryEvent } from '../../types/business';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';

export function EventCard({ event }: { event: BeneficiaryEvent }) {
  return (
    <View className="mb-4 rounded-card bg-white p-4" style={shadows.card}>
      <View className="mb-4 flex-row-reverse items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
          <Ionicons
            name={event.icon as IoniconsIconName}
            size={25}
            color={colors.primary}
          />
        </View>
        <AppText className="flex-1 text-xl font-bold">{event.name}</AppText>
        <View className="rounded-lg bg-primary-soft px-3 py-2">
          <AppText align="center" className="text-small font-bold text-primary">
            {event.dateLabel}
          </AppText>
        </View>
      </View>
      <View className="flex-row-reverse items-center justify-between gap-3">
        <View className="flex-row-reverse items-center gap-1">
          <Ionicons name="time-outline" size={14} color={colors.ink} />
          <AppText className="text-caption">{event.timeLabel}</AppText>
        </View>
        <View className="flex-1 flex-row-reverse items-center gap-1">
          <Ionicons name="location-outline" size={14} color={colors.ink} />
          <AppText numberOfLines={1} className="flex-1 text-caption">
            {event.location}
          </AppText>
        </View>
      </View>
    </View>
  );
}
