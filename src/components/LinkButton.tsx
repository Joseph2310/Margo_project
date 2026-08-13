import { Pressable } from 'react-native';
import { AppText } from './AppText';

interface Props {
  label: string;
  onPress: () => void;
  className?: string;
}

export function LinkButton({ label, onPress, className = '' }: Props) {
  return (
    <Pressable className={className} hitSlop={8} onPress={onPress}>
      <AppText className="text-body text-primary underline">{label}</AppText>
    </Pressable>
  );
}
