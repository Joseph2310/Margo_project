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

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';
  const submit = handleSubmit(() => navigation.replace('Login'));
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
      <PrimaryButton className="mt-10" label="متابعة" onPress={submit} />
    </Screen>
  );
}
