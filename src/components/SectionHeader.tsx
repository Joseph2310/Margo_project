import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { useLocalization } from '../localization';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { isRTL } = useLocalization();
  return (
    <View
      className={`mb-3 mt-5 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <AppText className="text-title font-medium">{title}</AppText>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <AppText className="text-small text-primary">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
