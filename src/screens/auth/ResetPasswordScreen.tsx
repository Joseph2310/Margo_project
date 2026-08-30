import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { PasswordRules } from '../../components/forms/PasswordRules';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import {
  createResetPasswordSchema,
  type ResetPasswordForm,
} from '../../utils/validation';
import { useResetPasswordMutation } from '../../providers/AuthProvider/hooks';
import { useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { t } = useLocalization();
  const resetPassword = useResetPasswordMutation();
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';
  const submit = handleSubmit(async values => {
    setServerError(undefined);
    try {
      await resetPassword.mutateAsync({
        ...values,
        email: route.params.email,
        resetToken: route.params.resetToken,
      });
      Alert.alert(
        t('auth.passwordResetSuccessTitle'),
        t('auth.passwordResetSuccessMessage'),
        [
          {
            text: t('auth.signIn'),
            onPress: () => navigation.replace('Login'),
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  });
  return (
    <Screen scroll={false}>
      <AppHeader title="" />
      <AppText align="center" className="mb-16 mt-6 text-title font-bold">
        {t('auth.newPasswordTitle')}
      </AppText>
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
            onChangeText={field.onChange}
          />
        )}
      />
      <PasswordRules password={password} />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            label={t('fields.confirmPassword')}
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.confirmPassword?.message}
            onChangeText={field.onChange}
          />
        )}
      />
      {serverError ? (
        <AppText align="center" className="mt-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <PrimaryButton
        className="mt-10"
        label={t('auth.resetPasswordAction')}
        loading={resetPassword.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
