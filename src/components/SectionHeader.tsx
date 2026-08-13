import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View className="mb-3 mt-5 flex-row-reverse items-center justify-between">
      <AppText className="text-title font-medium">{title}</AppText>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <AppText className="text-small text-primary">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
