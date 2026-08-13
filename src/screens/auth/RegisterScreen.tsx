import { zodResolver } from '@hookform/resolvers/zod';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { LinkButton } from '../../components/LinkButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { PasswordRules } from '../../components/forms/PasswordRules';
import { TextField } from '../../components/forms/TextField';
import type { RootStackParamList } from '../../types/navigation';
import {
  registrationSchema,
  type RegistrationForm,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const fields: Array<{
  name: keyof RegistrationForm;
  label: string;
  icon: IoniconsIconName;
  required?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
}> = [
  { name: 'name', label: 'الاسم', icon: 'person', required: true },
  {
    name: 'birthDate',
    label: 'تاريخ الميلاد',
    icon: 'calendar',
    required: true,
  },
  { name: 'stage', label: 'المرحلة', icon: 'people', required: true },
  { name: 'address', label: 'عنوان البيت', icon: 'home', required: true },
  {
    name: 'phone',
    label: 'رقم التليفون',
    icon: 'call',
    required: true,
    keyboardType: 'phone-pad',
  },
  {
    name: 'whatsapp',
    label: 'رقم الواتس اب',
    icon: 'logo-whatsapp',
    required: true,
    keyboardType: 'phone-pad',
  },
  { name: 'school', label: 'المدرسة', icon: 'school', required: true },
  {
    name: 'classSaintName',
    label: 'اسم قديس الفصل',
    icon: 'person-circle',
    required: true,
  },
  { name: 'confessionFather', label: 'اب الاعتراف ( إختياري )', icon: 'body' },
  { name: 'talentsText', label: 'المواهب', icon: 'add-circle' },
];

export function RegisterScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
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
  const submit = handleSubmit(values =>
    navigation.navigate('Verification', {
      mode: 'registration',
      email: values.email,
    }),
  );

  return (
    <Screen>
      <AppHeader title="إنشاء حساب" />
      <AppText className="text-label mb-4 font-medium">
        البيانات الشخصية
      </AppText>
      {fields.map(item => (
        <Controller
          key={String(item.name)}
          control={control}
          name={item.name}
          render={({ field }) => (
            <TextField
              label={item.label}
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
        البيانات الاساسية
      </AppText>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            label="البريد الالكتروني"
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
            label="كلمة المرور"
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
            label="تأكيد كلمة المرور"
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
      <PrimaryButton
        className="mt-4"
        label="إنشاء حساب"
        loading={isSubmitting}
        onPress={submit}
      />
      <View className="mt-6 flex-row-reverse justify-center gap-1">
        <AppText>لديك حساب ؟</AppText>
        <LinkButton
          label="تسجيل دخول"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </Screen>
  );
}
