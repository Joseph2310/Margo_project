import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../AppText';
import { useLocalization } from '../../localization';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpInput({ value, onChange, error }: Props) {
  const inputRef = useRef<TextInput>(null);
  const { isRTL, t } = useLocalization();
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '');
  return (
    <View>
      <Pressable
        className={`my-8 justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
        onPress={() => inputRef.current?.focus()}>
        {digits.map((digit, index) => (
          <View
            key={index}
            className={`h-12 w-10 items-center justify-center border-b ${
              digit ? 'border-primary' : 'border-line'
            }`}>
            <AppText align="center" className="text-title">
              {digit}
            </AppText>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        accessibilityLabel={t('auth.otpAccessibility')}
        className="absolute h-1 w-1 opacity-0"
        keyboardType="number-pad"
        maxLength={6}
        selectionColor={colors.primary}
        value={value}
        onChangeText={text => onChange(text.replace(/\D/g, '').slice(0, 6))}
      />
      {error ? (
        <AppText align="center" className="text-caption text-danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
