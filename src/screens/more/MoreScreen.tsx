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

export function MoreScreen() {
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
      label: 'الاقتراحات',
      icon: 'document-text',
      action: () => navigation.navigate('Suggestions'),
    },
    {
      label: 'الريفليكشن',
      icon: 'bulb',
      action: () => navigation.navigate('Reflection'),
    },
    {
      label: 'الإشعارات',
      icon: 'notifications',
      action: () => navigation.navigate('Notifications'),
    },
  ];
  const logout = () =>
    Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
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
        القائمة
      </AppText>
      <View className="mb-10 flex-row-reverse items-center rounded-card bg-white p-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-rose">
          <Ionicons name="person" size={28} color={colors.primary} />
        </View>
        <AppText className="text-label mr-4 font-bold text-primary">
          {profile.data?.name ?? ''}
        </AppText>
      </View>
      {items.map(item => (
        <Pressable
          key={item.label}
          className="mb-6 flex-row-reverse items-center bg-primary-soft px-3 py-2"
          onPress={item.action}>
          <Ionicons name={item.icon} size={25} color={colors.primary} />
          <AppText className="text-label mr-3">{item.label}</AppText>
        </Pressable>
      ))}
      <Pressable
        className="mb-10 mt-auto flex-row-reverse items-center gap-2"
        onPress={logout}>
        <Ionicons name="log-out-outline" size={26} color={colors.primary} />
        <AppText className="text-label font-bold text-primary">
          تسجيل الخروج
        </AppText>
      </Pressable>
    </Screen>
  );
}
