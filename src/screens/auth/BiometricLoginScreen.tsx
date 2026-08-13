import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { signIn } from '../../store/authSlice';
import { useAppDispatch } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BiometricLogin'>;

export function BiometricLoginScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const isFace = route.params.mode === 'face';
  const login = () => {
    dispatch(signIn({ beneficiaryId: 'beneficiary-design-fixture' }));
    navigation.replace('Main');
  };
  return (
    <Screen scroll={false}>
      <AppHeader title="تسجيل دخول" />
      <AppText className="text-label mt-2 font-bold">
        {isFace ? 'نسيت الرقم السري ؟ 👋' : 'اهلا ، مرحبا بك مرة اخرى 👋'}
      </AppText>
      <AppText className="text-label mt-8 font-medium">
        {isFace ? 'تسجيل الدخول بالـ face ID' : 'تسجيل الدخول بالبصمة'}
      </AppText>
      <Pressable className="flex-1 items-center justify-center" onPress={login}>
        <Ionicons
          name={isFace ? 'scan-outline' : 'finger-print'}
          size={150}
          color={colors.biometricIcon}
        />
      </Pressable>
      <View className="mb-6 flex-row items-center gap-4">
        <View className="h-px flex-1 bg-line" />
        <AppText align="center">أو</AppText>
        <View className="h-px flex-1 bg-line" />
      </View>
      <PrimaryButton
        label="تسجيل الدخول بالبريد الالكتروني"
        onPress={() => navigation.replace('Login')}
      />
    </Screen>
  );
}
