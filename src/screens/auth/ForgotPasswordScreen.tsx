import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import { createEmailSchema } from '../../utils/validation';
import { useForgotPasswordMutation } from '../../providers/AuthProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const forgotPassword = useForgotPasswordMutation();
  const send = async () => {
    const result = createEmailSchema(t).safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t('validation.emailInvalid'));
      return;
    }
    try {
      const challenge = await forgotPassword.mutateAsync(result.data);
      navigation.navigate('Verification', {
        mode: 'passwordReset',
        email: result.data,
        debugCode: challenge.verificationCode,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, t));
    }
  };
  return (
    <Screen scroll={false}>
      <AppHeader title="" />
      <AppText align="center" className="mt-6 text-title font-bold">
        {t('auth.forgotTitle')}
      </AppText>
      <AppText align="center" className="mb-12 mt-2 px-4 text-body">
        {t('auth.forgotDescription')}
      </AppText>
      <TextField
        label={t('fields.email')}
        icon="mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        error={error}
        onChangeText={value => {
          setEmail(value);
          setError(undefined);
        }}
      />
      <PrimaryButton
        className="mb-8 mt-auto"
        label={t('common.send')}
        loading={forgotPassword.isPending}
        onPress={send}
      />
    </Screen>
  );
}
