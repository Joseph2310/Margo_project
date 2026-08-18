import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { PasswordRules } from '../../components/forms/PasswordRules';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import {
  resetPasswordSchema,
  type ResetPasswordForm,
} from '../../utils/validation';
import { useResetPasswordMutation } from '../../providers/AuthProvider/hooks';
import { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const resetPassword = useResetPasswordMutation();
  const [serverError, setServerError] = useState<string>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
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
      navigation.replace('Login');
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  });
  return (
    <Screen scroll={false}>
      <AppHeader title="" />
      <AppText align="center" className="mb-16 mt-6 text-title font-bold">
        تسجيل كلمة مرور جديدة
      </AppText>
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
            label="تأكيد كلمة المرور"
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
        label="متابعة"
        loading={resetPassword.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
