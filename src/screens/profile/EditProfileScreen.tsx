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
import { useLocalization, type TranslationKey } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
type EditableKey = Exclude<
  keyof BeneficiaryProfile,
  'id' | 'points' | 'attendanceQrValue' | 'avatarUri' | 'talents'
>;

const fields: Array<{
  key: EditableKey;
  labelKey: TranslationKey;
  icon: IoniconsIconName;
  required?: boolean;
}> = [
  { key: 'name', labelKey: 'fields.name', icon: 'person', required: true },
  {
    key: 'birthDate',
    labelKey: 'fields.birthDate',
    icon: 'calendar',
    required: true,
  },
  { key: 'stage', labelKey: 'fields.stage', icon: 'people', required: true },
  { key: 'address', labelKey: 'fields.address', icon: 'home', required: true },
  { key: 'phone', labelKey: 'fields.phone', icon: 'call', required: true },
  {
    key: 'whatsapp',
    labelKey: 'fields.whatsapp',
    icon: 'logo-whatsapp',
    required: true,
  },
  { key: 'school', labelKey: 'fields.school', icon: 'school', required: true },
  {
    key: 'classSaintName',
    labelKey: 'fields.classSaintName',
    icon: 'person-circle',
    required: true,
  },
  {
    key: 'confessionFather',
    labelKey: 'fields.confessionFatherOptional',
    icon: 'body',
  },
  { key: 'email', labelKey: 'fields.email', icon: 'mail', required: true },
];

export function EditProfileScreen({ navigation }: Props) {
  const { language, t } = useLocalization();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const [draft, setDraft] = useState<BeneficiaryProfile>();
  const [talentsText, setTalentsText] = useState('');
  useEffect(() => {
    if (!profileQuery.data) return;
    setDraft(profileQuery.data);
    setTalentsText(
      profileQuery.data.talents.join(language === 'ar' ? '، ' : ', '),
    );
  }, [language, profileQuery.data]);
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
      Alert.alert(t('profile.saveError'), getApiErrorMessage(error, t));
    }
  };
  return (
    <Screen>
      <AppHeader title={t('profile.edit')} />
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
              label={t(field.labelKey)}
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
            label={t('fields.talents')}
            icon="add-circle"
            value={talentsText}
            onChangeText={setTalentsText}
          />
          <PrimaryButton
            className="mt-4"
            label={t('common.save')}
            loading={updateProfile.isPending}
            onPress={save}
          />
        </>
      ) : null}
    </Screen>
  );
}
