import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

type Props = ComponentProps<typeof Text> & {
  align?: 'right' | 'center' | 'left';
};

export function AppText({ style, align = 'right', ...props }: Props) {
  return (
    <Text
      {...props}
      allowFontScaling
      style={[
        styles.rtl,
        {
          color: colors.ink,
          fontFamily: undefined,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rtl: { writingDirection: 'rtl' },
});
