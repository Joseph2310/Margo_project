import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
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
import {
  createVerificationSchema,
  type VerificationForm,
} from '../../utils/validation';
import {
  useResendVerificationMutation,
  useVerifyMutation,
} from '../../providers/AuthProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

export function VerificationScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const { formatNumber, isRTL, t } = useLocalization();
  const verify = useVerifyMutation();
  const resend = useResendVerificationMutation();
  const { seconds, restart } = useCountdown(60);
  const { mode, email } = route.params;
  const [serverError, setServerError] = useState<string>();
  const [debugCode, setDebugCode] = useState(route.params.debugCode);
  const schema = useMemo(() => createVerificationSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerificationForm>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });
  const activation = mode === 'activation';
  const title = activation
    ? t('auth.activationTitle')
    : t('auth.registrationCodeTitle');
  const description = activation
    ? t('auth.activationDescription')
    : t('auth.registrationCodeDescription');

  const submit = handleSubmit(async values => {
    setServerError(undefined);
    try {
      const result = await verify.mutateAsync({
        email,
        mode,
        code: values.code,
      });
      if (mode === 'passwordReset') {
        if (!result.passwordResetToken) {
          throw new Error(t('auth.missingResetToken'));
        }
        navigation.replace('ResetPassword', {
          email,
          resetToken: result.passwordResetToken,
        });
        return;
      }
      if (!result.session) throw new Error(t('auth.sessionStartFailed'));
      dispatch(signIn(result.session));
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  });

  const resendCode = async () => {
    setServerError(undefined);
    try {
      const challenge = await resend.mutateAsync({ email, mode });
      setDebugCode(challenge.verificationCode);
      restart();
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  };

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
        {debugCode ? (
          <AppText align="center" className="text-small mt-2 text-muted">
            {t('auth.debugCode', { code: debugCode })}
          </AppText>
        ) : null}
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
            {t('auth.codeCountdown', { seconds: formatNumber(seconds) })}
          </AppText>
        ) : (
          <View className={`gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <AppText className="text-small">{t('auth.noCode')}</AppText>
            <LinkButton label={t('auth.resendCode')} onPress={resendCode} />
          </View>
        )}
      </View>
      {serverError ? (
        <AppText align="center" className="mb-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <PrimaryButton
        label={t('common.continue')}
        loading={isSubmitting || verify.isPending || resend.isPending}
        onPress={submit}
      />
    </Screen>
  );
}
