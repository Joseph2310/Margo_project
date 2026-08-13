import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import {
  changePasswordSchema,
  type ChangePasswordForm,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });
  const submit = handleSubmit(() => navigation.goBack());
  return (
    <Screen scroll={false}>
      <AppHeader title="تغيير كلمة المرور" />
      <Controller
        control={control}
        name="currentPassword"
        render={({ field }) => (
          <TextField
            label="كلمة المرور الحالية"
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
            label="كلمة المرور الجديدة"
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
            label="تأكيد كلمة المرور الجديدة"
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.confirmPassword?.message}
            onChangeText={field.onChange}
          />
        )}
      />
      <PrimaryButton className="mt-8" label="حفظ" onPress={submit} />
    </Screen>
  );
}
