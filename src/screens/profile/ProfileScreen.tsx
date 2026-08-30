import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, Linking, Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ProfileField } from '../../components/cards/ProfileField';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';
import {
  useProfileQuery,
  useWhatsAppGroupMutation,
} from '../../providers/ProfileProvider/hooks';
import { QueryState } from '../../components/feedback/QueryState';
import { getApiErrorMessage } from '../../api/errors';
import { useLocalization } from '../../localization';

export function ProfileScreen() {
  const { formatNumber, isRTL, language, t } = useLocalization();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profileQuery = useProfileQuery();
  const whatsappGroup = useWhatsAppGroupMutation();
  const profile = profileQuery.data;
  const fields: Array<{
    label: string;
    value: string;
    icon: IoniconsIconName;
  }> = profile
    ? [
        { label: t('fields.name'), value: profile.name, icon: 'person' },
        {
          label: t('fields.birthDate'),
          value: profile.birthDate,
          icon: 'calendar',
        },
        { label: t('fields.stage'), value: profile.stage, icon: 'people' },
        { label: t('fields.residence'), value: profile.address, icon: 'home' },
        { label: t('fields.phone'), value: profile.phone, icon: 'call' },
        {
          label: t('fields.whatsapp'),
          value: profile.whatsapp,
          icon: 'logo-whatsapp',
        },
        { label: t('fields.school'), value: profile.school, icon: 'school' },
        {
          label: t('fields.classSaintName'),
          value: profile.classSaintName,
          icon: 'person-circle',
        },
        {
          label: t('fields.confessionFather'),
          value: profile.confessionFather ?? '',
          icon: 'body',
        },
        {
          label: t('fields.talents'),
          value: profile.talents.join(language === 'ar' ? '، ' : ', '),
          icon: 'calendar',
        },
        { label: t('fields.email'), value: profile.email, icon: 'mail' },
      ]
    : [];
  const openWhatsAppGroup = async () => {
    try {
      const url = await whatsappGroup.mutateAsync();
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        t('profile.whatsappGroupError'),
        getApiErrorMessage(error, t),
      );
    }
  };
  return (
    <Screen bottomInset={false}>
      <QueryState
        loading={profileQuery.isLoading}
        error={profileQuery.isError}
        onRetry={() => profileQuery.refetch()}
      />
      {profile ? (
        <>
          <View
            className={`mb-5 mt-2 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              className="h-12 w-14 items-center justify-center rounded-lg bg-primary-soft"
              onPress={() => navigation.goBack()}>
              <Ionicons
                name={isRTL ? 'chevron-forward' : 'chevron-back'}
                size={20}
                color={colors.primary}
              />
            </Pressable>
            <AppText align="center" className="text-title">
              {t('profile.title')}
            </AppText>
            <Pressable onPress={() => navigation.navigate('EditProfile')}>
              <AppText className="text-small text-primary">
                {t('profile.edit')}
              </AppText>
            </Pressable>
          </View>
          <View className="mb-5 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-rose">
              <Ionicons name="person" size={42} color={colors.primary} />
              <View
                className={`absolute bottom-0 h-6 w-6 items-center justify-center rounded-full bg-primary ${isRTL ? 'right-0' : 'left-0'}`}>
                <Ionicons name="camera" size={12} color={colors.surface} />
              </View>
            </View>
          </View>
          {fields.map(field => (
            <ProfileField key={field.label} {...field} />
          ))}
          <Pressable
            className={`my-5 ${isRTL ? 'self-end' : 'self-start'}`}
            onPress={() => navigation.navigate('ChangePassword')}>
            <AppText className="text-small text-primary underline">
              {t('profile.changePassword')}
            </AppText>
          </Pressable>
          <View
            className={`mb-6 items-center justify-center gap-10 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <View>
              <AppText className="text-body">{t('profile.points')}</AppText>
              <AppText className="text-label mt-2">
                {t('common.points', { count: formatNumber(profile.points) })}
              </AppText>
            </View>
            <View className="h-16 w-px bg-ink" />
            <QRCode
              value={profile.attendanceQrValue}
              size={70}
              color={colors.ink}
            />
          </View>
          <PrimaryButton
            label={t('profile.whatsappGroup')}
            loading={whatsappGroup.isPending}
            onPress={openWhatsAppGroup}
          />
        </>
      ) : null}
    </Screen>
  );
}
