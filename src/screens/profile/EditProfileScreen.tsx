import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/forms/TextField';
import type { BeneficiaryProfile } from '../../types/business';
import type { RootStackParamList } from '../../types/navigation';
import { splitTalents } from '../../utils/format';
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '../../providers/ProfileProvider/hooks';
import { QueryState } from '../../components/feedback/QueryState';
import { getApiErrorMessage } from '../../api/errors';

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
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const [draft, setDraft] = useState<BeneficiaryProfile>();
  const [talentsText, setTalentsText] = useState('');
  useEffect(() => {
    if (!profileQuery.data) return;
    setDraft(profileQuery.data);
    setTalentsText(profileQuery.data.talents.join('، '));
  }, [profileQuery.data]);
  const save = async () => {
    if (!draft) return;
    try {
      await updateProfile.mutateAsync({
        name: draft.name,
        birthDate: draft.birthDate,
        stage: draft.stage,
        address: draft.address,
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        school: draft.school,
        classSaintName: draft.classSaintName,
        confessionFather: draft.confessionFather,
        email: draft.email,
        avatarUri: draft.avatarUri,
        talents: splitTalents(talentsText),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('تعذر حفظ البيانات', getApiErrorMessage(error));
    }
  };
  return (
    <Screen>
      <AppHeader title="تعديل البيانات" />
      <QueryState
        loading={profileQuery.isLoading}
        error={profileQuery.isError}
        onRetry={() => profileQuery.refetch()}
      />
      {draft ? (
        <>
          {fields.map(field => (
            <TextField
              key={field.key}
              label={field.label}
              icon={field.icon}
              required={field.required}
              value={draft[field.key] ?? ''}
              onChangeText={value =>
                setDraft(current =>
                  current ? { ...current, [field.key]: value } : current,
                )
              }
            />
          ))}
          <TextField
            label="المواهب"
            icon="add-circle"
            value={talentsText}
            onChangeText={setTalentsText}
          />
          <PrimaryButton
            className="mt-4"
            label="حفظ"
            loading={updateProfile.isPending}
            onPress={save}
          />
        </>
      ) : null}
    </Screen>
  );
}
