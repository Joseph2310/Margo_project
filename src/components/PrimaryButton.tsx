import { ActivityIndicator, Pressable } from 'react-native';
import { colors } from '../theme/tokens';
import { AppText } from './AppText';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  className = '',
}: Props) {
  const unavailable = Boolean(disabled || loading);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      className={`h-12 items-center justify-center rounded-button ${
        unavailable ? 'bg-disabled' : 'bg-primary active:opacity-80'
      } ${className}`}
      disabled={unavailable}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <AppText align="center" className="text-label text-white">
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
