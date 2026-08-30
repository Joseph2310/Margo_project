import { Pressable, View } from 'react-native';
import { AppText } from '../AppText';
import { useLocalization } from '../../localization';

interface Props {
  anonymous: boolean;
  onChange: (anonymous: boolean) => void;
}

export function IdentityToggle({ anonymous, onChange }: Props) {
  const { isRTL, t } = useLocalization();
  return (
    <View
      className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} overflow-hidden rounded-md bg-primary-soft`}>
      <Pressable
        className={`px-4 py-2 ${anonymous ? 'bg-primary' : ''}`}
        onPress={() => onChange(true)}>
        <AppText className={anonymous ? 'text-white' : 'text-ink'}>
          {t('identity.anonymous')}
        </AppText>
      </Pressable>
      <Pressable
        className={`px-4 py-2 ${!anonymous ? 'bg-primary' : ''}`}
        onPress={() => onChange(false)}>
        <AppText className={!anonymous ? 'text-white' : 'text-ink'}>
          {t('identity.named')}
        </AppText>
      </Pressable>
    </View>
  );
}
