import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { View } from 'react-native';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';

interface Props {
  label: string;
  value: string;
  icon: IoniconsIconName;
}

export function ProfileField({ label, value, icon }: Props) {
  return (
    <View
      className="mb-3 flex-row-reverse items-center rounded-card bg-white px-3 py-2"
      style={shadows.card}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <View className="mr-2 flex-1">
        <AppText className="text-caption text-muted">{label}</AppText>
        <AppText className="text-body">{value || '—'}</AppText>
      </View>
    </View>
  );
}
