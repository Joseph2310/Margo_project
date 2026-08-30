import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, TextInput, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { IdentityToggle } from './IdentityToggle';
import { AppText } from '../AppText';
import { directionStyles, useLocalization } from '../../localization';

interface Props {
  value: string;
  anonymous: boolean;
  senderName?: string;
  sending?: boolean;
  onChangeText: (value: string) => void;
  onIdentityChange: (anonymous: boolean) => void;
  onSend: () => void;
}

export function MessageComposer({
  value,
  anonymous,
  senderName,
  sending = false,
  onChangeText,
  onIdentityChange,
  onSend,
}: Props) {
  const { isRTL, t } = useLocalization();
  return (
    <View className="border-t border-primary/20 bg-chat-panel/90 p-4">
      <AppText className="mb-1 text-caption text-muted">
        {anonymous ? t('chat.anonymous') : (senderName ?? '')}
      </AppText>
      <View
        className={`mb-3 items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <TextInput
          className="h-10 flex-1 rounded-full bg-primary-soft px-4 text-ink"
          placeholder=""
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          textAlign={isRTL ? 'right' : 'left'}
          style={isRTL ? directionStyles.rtlText : directionStyles.ltrText}
        />
        <Pressable disabled={!value.trim() || sending} onPress={onSend}>
          <Ionicons
            name="send"
            size={21}
            color={value.trim() && !sending ? colors.primary : colors.muted}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        </Pressable>
      </View>
      <View
        className={`items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppText className="text-body">{t('chat.sendMessage')}</AppText>
        <IdentityToggle anonymous={anonymous} onChange={onIdentityChange} />
      </View>
    </View>
  );
}
