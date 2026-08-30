import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { View } from 'react-native';
import { colors, shadows } from '../../theme/tokens';
import { AppText } from '../AppText';
import { useLocalization } from '../../localization';

interface Props {
  label: string;
  value: string;
  icon: IoniconsIconName;
}

export function ProfileField({ label, value, icon }: Props) {
  const { isRTL } = useLocalization();
  return (
    <View
      className={`mb-3 items-center gap-2 rounded-card bg-white px-3 py-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
      style={shadows.card}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <View className="flex-1">
        <AppText className="text-caption text-muted">{label}</AppText>
        <AppText className="text-body">{value || '—'}</AppText>
      </View>
    </View>
  );
}
