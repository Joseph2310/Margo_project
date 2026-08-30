import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import {
  createChangePasswordSchema,
  type ChangePasswordForm,
} from '../../utils/validation';
import { useChangePasswordMutation } from '../../providers/AuthProvider/hooks';
import { useAppDispatch } from '../../store/hooks';
import { signOut } from '../../store/authSlice';
import { getApiErrorMessage } from '../../api/errors';
import { useMemo, useState } from 'react';
import { AppText } from '../../components/AppText';
import { useLocalization } from '../../localization';

export function ChangePasswordScreen() {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const changePassword = useChangePasswordMutation();
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createChangePasswordSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });
  const submit = handleSubmit(async values => {
    setServerError(undefined);
    try {
      await changePassword.mutateAsync(values);
      dispatch(signOut());
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  });
  return (
    <Screen scroll={false}>
      <AppHeader title={t('auth.changePassword')} />
      <Controller
        control={control}
        name="currentPassword"
        render={({ field }) => (
          <TextField
            label={t('auth.currentPassword')}
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.currentPassword?.message}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            label={t('auth.newPassword')}
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.password?.message}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            label={t('auth.confirmNewPassword')}
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
        className="mt-8"
        label={t('common.save')}
        loading={changePassword.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
