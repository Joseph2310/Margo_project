import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/tokens';
import { directionStyles, useLocalization } from '../localization';

type Props = ComponentProps<typeof Text> & {
  align?: 'right' | 'center' | 'left';
};

export function AppText({ style, align, ...props }: Props) {
  const { isRTL } = useLocalization();
  return (
    <Text
      {...props}
      allowFontScaling
      style={[
        {
          color: colors.ink,
          fontFamily: undefined,
          textAlign: align ?? (isRTL ? 'right' : 'left'),
        },
        isRTL ? directionStyles.rtlText : directionStyles.ltrText,
        style,
      ]}
    />
  );
}
