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
import { useRefreshSessionMutation } from '../../providers/AuthProvider/hooks';
import { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { useAppSelector } from '../../store/hooks';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'BiometricLogin'>;

export function BiometricLoginScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isRTL, t } = useLocalization();
  const refresh = useRefreshSessionMutation();
  const refreshToken = useAppSelector(state => state.auth.refreshToken);
  const [serverError, setServerError] = useState<string>();
  const isFace = route.params.mode === 'face';
  const login = async () => {
    if (!refreshToken) {
      navigation.replace('Login');
      return;
    }
    try {
      const session = await refresh.mutateAsync(refreshToken);
      dispatch(signIn(session));
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  };
  return (
    <Screen scroll={false}>
      <AppHeader title={t('auth.signIn')} />
      <AppText className="text-label mt-2 font-bold">
        {isFace ? t('auth.faceGreeting') : t('auth.welcomeBack')}
      </AppText>
      <AppText className="text-label mt-8 font-medium">
        {isFace ? t('auth.faceLogin') : t('auth.fingerprintLogin')}
      </AppText>
      <Pressable className="flex-1 items-center justify-center" onPress={login}>
        <Ionicons
          name={isFace ? 'scan-outline' : 'finger-print'}
          size={150}
          color={colors.biometricIcon}
        />
      </Pressable>
      {serverError ? (
        <AppText align="center" className="mb-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <View
        className={`mb-6 items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <View className="h-px flex-1 bg-line" />
        <AppText align="center">{t('common.or')}</AppText>
        <View className="h-px flex-1 bg-line" />
      </View>
      <PrimaryButton
        label={t('auth.emailLogin')}
        onPress={() => navigation.replace('Login')}
      />
    </Screen>
  );
}
