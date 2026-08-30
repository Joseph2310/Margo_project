import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { LinkButton } from '../../components/LinkButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import { signIn } from '../../store/authSlice';
import { useAppDispatch } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';
import { createLoginSchema, type LoginForm } from '../../utils/validation';
import { useLoginMutation } from '../../providers/AuthProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isRTL, t, toggleLanguage } = useLocalization();
  const login = useLoginMutation();
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async values => {
    setServerError(undefined);
    try {
      const session = await login.mutateAsync(values);
      dispatch(signIn(session));
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  });

  return (
    <Screen contentClassName="min-h-full">
      <AppHeader
        title={t('auth.signIn')}
        showBack={false}
        actionLabel={t('language.switchShort')}
        onAction={toggleLanguage}
      />
      <AppText className="text-label mb-8 mt-6 font-bold">
        {t('auth.welcomeBack')}
      </AppText>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label={t('fields.email')}
            icon="mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={field.value}
            error={errors.email?.message}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label={t('fields.password')}
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.password?.message}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
          />
        )}
      />
      <LinkButton
        label={t('auth.forgotPassword')}
        className={`mb-8 ${isRTL ? 'self-end' : 'self-start'}`}
        onPress={() => navigation.navigate('ForgotPassword')}
      />
      {serverError ? (
        <AppText align="center" className="mb-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <PrimaryButton
        label={t('auth.signIn')}
        loading={isSubmitting || login.isPending}
        onPress={submit}
      />
      <View
        className={`mt-9 justify-center gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <Pressable
          accessibilityLabel={t('auth.faceLoginAccessibility')}
          className="h-14 w-14 items-center justify-center rounded-md bg-orange"
          onPress={() =>
            navigation.navigate('BiometricLogin', { mode: 'face' })
          }>
          <Ionicons name="scan-outline" size={29} color={colors.surface} />
        </Pressable>
        <Pressable
          accessibilityLabel={t('auth.fingerprintLoginAccessibility')}
          className="h-14 w-14 items-center justify-center rounded-md bg-orange"
          onPress={() =>
            navigation.navigate('BiometricLogin', { mode: 'fingerprint' })
          }>
          <Ionicons name="finger-print" size={29} color={colors.surface} />
        </Pressable>
      </View>
      <View
        className={`mt-auto items-center justify-center gap-1 pb-4 pt-16 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppText className="text-body">{t('auth.noAccount')}</AppText>
        <LinkButton
          label={t('auth.createAccount')}
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </Screen>
  );
}
