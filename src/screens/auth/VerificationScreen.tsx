import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { LinkButton } from '../../components/LinkButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { OtpInput } from '../../components/forms/OtpInput';
import { useCountdown } from '../../hooks/useCountdown';
import { signIn } from '../../store/authSlice';
import { useAppDispatch } from '../../store/hooks';
import type { RootStackParamList } from '../../types/navigation';
import { toArabicDigits } from '../../utils/format';
import {
  verificationSchema,
  type VerificationForm,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

export function VerificationScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const { seconds, restart } = useCountdown(60);
  const { mode, email } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: '' },
  });
  const activation = mode === 'activation';
  const title = activation ? 'تأكيد تفعيل الحساب' : 'كود التسجيل';
  const description = activation
    ? 'ادخل كود تفعيل الحساب المرسل لك'
    : 'من فضلك ادخل كود التسجيل الذى تم ارساله الى بريدك الالكترونى';

  const submit = handleSubmit(() => {
    if (mode === 'passwordReset') {
      navigation.replace('ResetPassword', { email });
      return;
    }
    dispatch(signIn({ beneficiaryId: 'beneficiary-design-fixture' }));
    navigation.replace('Main');
  });

  return (
    <Screen scroll={false}>
      <AppHeader title="" />
      <View className="pt-4">
        <AppText align="center" className="text-title font-bold">
          {title}
        </AppText>
        <AppText align="center" className="mt-2 px-10 text-body">
          {description}
        </AppText>
      </View>
      <Controller
        control={control}
        name="code"
        render={({ field }) => (
          <OtpInput
            value={field.value}
            error={errors.code?.message}
            onChange={field.onChange}
          />
        )}
      />
      <View className="mb-16 items-center">
        {seconds > 0 ? (
          <AppText align="center" className="text-small text-muted">
            سيصلك الكود خلال{' '}
            <AppText className="text-primary">
              {toArabicDigits(seconds)}
            </AppText>{' '}
            ثانية
          </AppText>
        ) : (
          <View className="flex-row-reverse gap-1">
            <AppText className="text-small">لم تستقبل كود</AppText>
            <LinkButton label="إعادة إرسال؟" onPress={restart} />
          </View>
        )}
      </View>
      <PrimaryButton label="متابعة" loading={isSubmitting} onPress={submit} />
    </Screen>
  );
}
