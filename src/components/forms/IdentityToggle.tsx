import { Pressable, View } from 'react-native';
import { AppText } from '../AppText';

interface Props {
  anonymous: boolean;
  onChange: (anonymous: boolean) => void;
}

export function IdentityToggle({ anonymous, onChange }: Props) {
  return (
    <View className="flex-row-reverse overflow-hidden rounded-md bg-primary-soft">
      <Pressable
        className={`px-4 py-2 ${anonymous ? 'bg-primary' : ''}`}
        onPress={() => onChange(true)}>
        <AppText className={anonymous ? 'text-white' : 'text-ink'}>
          من مجهول
        </AppText>
      </Pressable>
      <Pressable
        className={`px-4 py-2 ${!anonymous ? 'bg-primary' : ''}`}
        onPress={() => onChange(false)}>
        <AppText className={!anonymous ? 'text-white' : 'text-ink'}>
          بالاسم
        </AppText>
      </Pressable>
    </View>
  );
}
