import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, View } from 'react-native';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { signOut } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';
import { useProfileQuery } from '../../providers/ProfileProvider/hooks';
import { useLogoutMutation } from '../../providers/AuthProvider/hooks';
import { useLocalization } from '../../localization';

export function MoreScreen() {
  const { isRTL, language, t, toggleLanguage } = useLocalization();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(state => state.auth.refreshToken);
  const profile = useProfileQuery();
  const logoutMutation = useLogoutMutation();
  const items: Array<{
    label: string;
    icon: IoniconsIconName;
    action: () => void;
  }> = [
    {
      label: t('more.suggestions'),
      icon: 'document-text',
      action: () => navigation.navigate('Suggestions'),
    },
    {
      label: t('more.reflection'),
      icon: 'bulb',
      action: () => navigation.navigate('Reflection'),
    },
    {
      label: t('more.notifications'),
      icon: 'notifications',
      action: () => navigation.navigate('Notifications'),
    },
    {
      label: t('language.setting', {
        language: t(language === 'ar' ? 'language.arabic' : 'language.english'),
      }),
      icon: 'language',
      action: toggleLanguage,
    },
  ];
  const logout = () =>
    Alert.alert(t('more.logout'), t('more.logoutPrompt'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('more.logout'),
        style: 'destructive',
        onPress: async () => {
          if (refreshToken) {
            try {
              await logoutMutation.mutateAsync(refreshToken);
            } catch {
              // Local logout must still complete if the remote session expired.
            }
          }
          dispatch(signOut());
        },
      },
    ]);
  return (
    <Screen scroll={false} bottomInset={false}>
      <AppText align="center" className="my-5 text-title">
        {t('more.title')}
      </AppText>
      <View
        className={`mb-10 items-center gap-4 rounded-card bg-white p-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <View className="h-14 w-14 items-center justify-center rounded-full bg-rose">
          <Ionicons name="person" size={28} color={colors.primary} />
        </View>
        <AppText className="text-label font-bold text-primary">
          {profile.data?.name ?? ''}
        </AppText>
      </View>
      {items.map(item => (
        <Pressable
          key={item.label}
          className={`mb-6 items-center gap-3 bg-primary-soft px-3 py-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          onPress={item.action}>
          <Ionicons name={item.icon} size={25} color={colors.primary} />
          <AppText className="text-label">{item.label}</AppText>
        </Pressable>
      ))}
      <Pressable
        className={`mb-10 mt-auto items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
        onPress={logout}>
        <Ionicons name="log-out-outline" size={26} color={colors.primary} />
        <AppText className="text-label font-bold text-primary">
          {t('more.logout')}
        </AppText>
      </Pressable>
    </Screen>
  );
}
