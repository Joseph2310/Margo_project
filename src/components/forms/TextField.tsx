import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { AppText } from '../AppText';
import { directionStyles, useLocalization } from '../../localization';

interface Props extends TextInputProps {
  label: string;
  icon?: IoniconsIconName;
  error?: string;
  required?: boolean;
}

export function TextField({
  label,
  icon = 'mail',
  error,
  required,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const { isRTL } = useLocalization();
  return (
    <View className="mb-4">
      <View
        className={`items-end gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
          <Ionicons name={icon} size={17} color={colors.primary} />
        </View>
        <View className="flex-1 border-b border-line pb-1">
          <AppText
            className={`text-caption ${error ? 'text-danger' : 'text-muted'}`}>
            {label}
            {required ? ' *' : ''}
          </AppText>
          <TextInput
            {...inputProps}
            accessibilityLabel={label}
            className="min-h-7 p-0 text-body text-ink"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            secureTextEntry={secureTextEntry ? hidden : false}
            textAlign={isRTL ? 'right' : 'left'}
            style={isRTL ? directionStyles.rtlText : directionStyles.ltrText}
          />
        </View>
        {secureTextEntry ? (
          <Ionicons
            name={hidden ? 'eye-off' : 'eye'}
            size={18}
            color={colors.primary}
            onPress={() => setHidden(current => !current)}
          />
        ) : null}
      </View>
      {error ? (
        <AppText
          className={`${isRTL ? 'mr-[52px]' : 'ml-[52px]'} mt-1 text-caption text-danger`}>
          ⓘ {error}
        </AppText>
      ) : null}
    </View>
  );
}
