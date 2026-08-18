import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
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
import { loginSchema, type LoginForm } from '../../utils/validation';
import { useLoginMutation } from '../../providers/AuthProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const login = useLoginMutation();
  const [serverError, setServerError] = useState<string>();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async values => {
    setServerError(undefined);
    try {
      const session = await login.mutateAsync(values);
      dispatch(signIn(session));
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  });

  return (
    <Screen contentClassName="min-h-full">
      <AppHeader title="تسجيل دخول" />
      <AppText className="text-label mb-8 mt-6 font-bold">
        اهلا ، مرحبا بك مرة اخرى 👋
      </AppText>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="البريد الالكتروني"
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
            label="كلمة المرور"
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
        label="هل نسيت رقمك السري؟"
        className="mb-8 self-start"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
      {serverError ? (
        <AppText align="center" className="mb-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <PrimaryButton
        label="تسجيل دخول"
        loading={isSubmitting || login.isPending}
        onPress={submit}
      />
      <View className="mt-9 flex-row justify-center gap-8">
        <Pressable
          accessibilityLabel="تسجيل الدخول بالوجه"
          className="h-14 w-14 items-center justify-center rounded-md bg-orange"
          onPress={() =>
            navigation.navigate('BiometricLogin', { mode: 'face' })
          }>
          <Ionicons name="scan-outline" size={29} color={colors.surface} />
        </Pressable>
        <Pressable
          accessibilityLabel="تسجيل الدخول بالبصمة"
          className="h-14 w-14 items-center justify-center rounded-md bg-orange"
          onPress={() =>
            navigation.navigate('BiometricLogin', { mode: 'fingerprint' })
          }>
          <Ionicons name="finger-print" size={29} color={colors.surface} />
        </Pressable>
      </View>
      <View className="mt-auto flex-row-reverse items-center justify-center gap-1 pb-4 pt-16">
        <AppText className="text-body">ليس لديك حساب ؟</AppText>
        <LinkButton
          label="إنشاء حساب"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </Screen>
  );
}
