import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, TextInput, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { IdentityToggle } from './IdentityToggle';
import { AppText } from '../AppText';

interface Props {
  value: string;
  anonymous: boolean;
  onChangeText: (value: string) => void;
  onIdentityChange: (anonymous: boolean) => void;
  onSend: () => void;
}

export function MessageComposer({
  value,
  anonymous,
  onChangeText,
  onIdentityChange,
  onSend,
}: Props) {
  return (
    <View className="border-t border-primary/20 bg-chat-panel/90 p-4">
      <AppText className="mb-1 text-caption text-muted">
        {anonymous ? 'مجهول الهوية' : 'جوي بركات'}
      </AppText>
      <View className="mb-3 flex-row-reverse items-center gap-3">
        <TextInput
          className="h-10 flex-1 rounded-full bg-primary-soft px-4 text-right text-ink"
          placeholder=""
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
        />
        <Ionicons name="mic" size={20} color={colors.primary} />
        <Ionicons name="image" size={20} color={colors.primary} />
        <Pressable disabled={!value.trim()} onPress={onSend}>
          <Ionicons
            name="send"
            size={21}
            color={value.trim() ? colors.primary : colors.muted}
          />
        </Pressable>
      </View>
      <View className="flex-row-reverse items-center justify-between">
        <AppText className="text-body">إرسال رسالة :</AppText>
        <IdentityToggle anonymous={anonymous} onChange={onIdentityChange} />
      </View>
    </View>
  );
}
