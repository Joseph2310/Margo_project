import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfile } from '../../store/profileSlice';
import type { BeneficiaryProfile } from '../../types/business';
import type { RootStackParamList } from '../../types/navigation';
import { splitTalents } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
type EditableKey = Exclude<
  keyof BeneficiaryProfile,
  'id' | 'points' | 'attendanceQrValue' | 'avatarUri' | 'talents'
>;

const fields: Array<{
  key: EditableKey;
  label: string;
  icon: IoniconsIconName;
  required?: boolean;
}> = [
  { key: 'name', label: 'الاسم', icon: 'person', required: true },
  {
    key: 'birthDate',
    label: 'تاريخ الميلاد',
    icon: 'calendar',
    required: true,
  },
  { key: 'stage', label: 'المرحلة', icon: 'people', required: true },
  { key: 'address', label: 'عنوان البيت', icon: 'home', required: true },
  { key: 'phone', label: 'رقم التليفون', icon: 'call', required: true },
  {
    key: 'whatsapp',
    label: 'رقم الواتس اب',
    icon: 'logo-whatsapp',
    required: true,
  },
  { key: 'school', label: 'المدرسة', icon: 'school', required: true },
  {
    key: 'classSaintName',
    label: 'اسم قديس الفصل',
    icon: 'person-circle',
    required: true,
  },
  { key: 'confessionFather', label: 'اب الاعتراف ( إختياري )', icon: 'body' },
  { key: 'email', label: 'البريد الالكتروني', icon: 'mail', required: true },
];

export function EditProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(state => state.profile.beneficiary);
  const [draft, setDraft] = useState(profile);
  const [talentsText, setTalentsText] = useState(profile.talents.join('، '));
  const save = () => {
    dispatch(updateProfile({ ...draft, talents: splitTalents(talentsText) }));
    navigation.goBack();
  };
  return (
    <Screen>
      <AppHeader title="تعديل البيانات" />
      {fields.map(field => (
        <TextField
          key={field.key}
          label={field.label}
          icon={field.icon}
          required={field.required}
          value={draft[field.key] ?? ''}
          onChangeText={value =>
            setDraft(current => ({ ...current, [field.key]: value }))
          }
        />
      ))}
      <TextField
        label="المواهب"
        icon="add-circle"
        value={talentsText}
        onChangeText={setTalentsText}
      />
      <PrimaryButton className="mt-4" label="حفظ" onPress={save} />
    </Screen>
  );
}
