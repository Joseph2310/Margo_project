import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import { emailSchema } from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const send = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'البريد الالكتروني غير صحيح');
      return;
    }
    navigation.navigate('Verification', {
      mode: 'passwordReset',
      email: result.data,
    });
  };
  return (
    <Screen scroll={false}>
      <AppHeader title="" />
      <AppText align="center" className="mt-6 text-title font-bold">
        نسيت كلمة السر ؟
      </AppText>
      <AppText align="center" className="mb-12 mt-2 px-4 text-body">
        اذا كنت نسيت كلمة المرور الخاصة بك أدخل بريدك الالكتروني ليصلك كود
        التسجيل
      </AppText>
      <TextField
        label="البريد الالكتروني"
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
      <PrimaryButton className="mb-8 mt-auto" label="إرسال" onPress={send} />
    </Screen>
  );
}
