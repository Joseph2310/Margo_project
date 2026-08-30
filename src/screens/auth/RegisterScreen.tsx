import { zodResolver } from '@hookform/resolvers/zod';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { useMemo, useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { LinkButton } from '../../components/LinkButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { PasswordRules } from '../../components/forms/PasswordRules';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import {
  createRegistrationSchema,
  type RegistrationForm,
} from '../../utils/validation';
import { useRegisterMutation } from '../../providers/AuthProvider/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { splitTalents } from '../../utils/format';
import { useLocalization, type TranslationKey } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const fields: Array<{
  name: keyof RegistrationForm;
  labelKey: TranslationKey;
  icon: IoniconsIconName;
  required?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
}> = [
  { name: 'name', labelKey: 'fields.name', icon: 'person', required: true },
  {
    name: 'birthDate',
    labelKey: 'fields.birthDate',
    icon: 'calendar',
    required: true,
  },
  { name: 'stage', labelKey: 'fields.stage', icon: 'people', required: true },
  { name: 'address', labelKey: 'fields.address', icon: 'home', required: true },
  {
    name: 'phone',
    labelKey: 'fields.phone',
    icon: 'call',
    required: true,
    keyboardType: 'phone-pad',
  },
  {
    name: 'whatsapp',
    labelKey: 'fields.whatsapp',
    icon: 'logo-whatsapp',
    required: true,
    keyboardType: 'phone-pad',
  },
  { name: 'school', labelKey: 'fields.school', icon: 'school', required: true },
  {
    name: 'classSaintName',
    labelKey: 'fields.classSaintName',
    icon: 'person-circle',
    required: true,
  },
  {
    name: 'confessionFather',
    labelKey: 'fields.confessionFatherOptional',
    icon: 'body',
  },
  { name: 'talentsText', labelKey: 'fields.talents', icon: 'add-circle' },
];

export function RegisterScreen({ navigation }: Props) {
  const { isRTL, t } = useLocalization();
  const register = useRegisterMutation();
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createRegistrationSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      birthDate: '',
      stage: '',
      address: '',
      phone: '',
      whatsapp: '',
      school: '',
      classSaintName: '',
      confessionFather: '',
      talentsText: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';
  const submit = handleSubmit(async values => {
    setServerError(undefined);
    const { talentsText, ...fieldsPayload } = values;
    try {
      const challenge = await register.mutateAsync({
        ...fieldsPayload,
        talents: splitTalents(talentsText ?? ''),
      });
      navigation.navigate('Verification', {
        mode: 'registration',
        email: values.email,
        debugCode: challenge.verificationCode,
      });
    } catch (error) {
      setServerError(getApiErrorMessage(error, t));
    }
  });

  return (
    <Screen>
      <AppHeader title={t('auth.createAccount')} />
      <AppText className="text-label mb-4 font-medium">
        {t('auth.personalData')}
      </AppText>
      {fields.map(item => (
        <Controller
          key={String(item.name)}
          control={control}
          name={item.name}
          render={({ field }) => (
            <TextField
              label={t(item.labelKey)}
              icon={item.icon}
              required={item.required}
              keyboardType={item.keyboardType}
              value={String(field.value ?? '')}
              error={errors[item.name]?.message}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
            />
          )}
        />
      ))}
      <AppText className="text-label mb-4 mt-2 font-medium">
        {t('auth.basicData')}
      </AppText>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label={t('fields.email')}
            icon="mail"
            required
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
            label={t('fields.password')}
            icon="lock-closed"
            secureTextEntry
            value={field.value}
            error={errors.password?.message}
            onBlur={field.onBlur}
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
            onBlur={field.onBlur}
            onChangeText={field.onChange}
          />
        )}
      />
      <PasswordRules password={password} />
      {serverError ? (
        <AppText align="center" className="mt-3 text-danger">
          {serverError}
        </AppText>
      ) : null}
      <PrimaryButton
        className="mt-4"
        label={t('auth.createAccount')}
        loading={isSubmitting || register.isPending}
        onPress={submit}
      />
      <View
        className={`mt-6 justify-center gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <AppText>{t('auth.haveAccount')}</AppText>
        <LinkButton
          label={t('auth.signIn')}
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </Screen>
  );
}
