import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ProfileField } from '../../components/cards/ProfileField';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useAppSelector(state => state.profile.beneficiary);
  const fields: Array<{
    label: string;
    value: string;
    icon: IoniconsIconName;
  }> = [
    { label: 'الاسم', value: profile.name, icon: 'person' },
    { label: 'تاريخ الميلاد', value: profile.birthDate, icon: 'calendar' },
    { label: 'المرحلة', value: profile.stage, icon: 'people' },
    { label: 'محل الاقامة', value: profile.address, icon: 'home' },
    { label: 'رقم الهاتف', value: profile.phone, icon: 'call' },
    { label: 'رقم الواتس اب', value: profile.whatsapp, icon: 'logo-whatsapp' },
    { label: 'المدرسة', value: profile.school, icon: 'school' },
    {
      label: 'اسم قديس الفصل',
      value: profile.classSaintName,
      icon: 'person-circle',
    },
    {
      label: 'اب الاعتراف',
      value: profile.confessionFather ?? '',
      icon: 'body',
    },
    { label: 'المواهب', value: profile.talents.join('، '), icon: 'calendar' },
    { label: 'البريد الالكتروني', value: profile.email, icon: 'mail' },
  ];
  return (
    <Screen bottomInset={false}>
      <View className="mb-5 mt-2 flex-row items-center justify-between">
        <Pressable
          className="h-12 w-14 items-center justify-center rounded-lg bg-primary-soft"
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
        <AppText align="center" className="text-title">
          البروفايل
        </AppText>
        <Pressable onPress={() => navigation.navigate('EditProfile')}>
          <AppText className="text-small text-primary">تعديل البيانات</AppText>
        </Pressable>
      </View>
      <View className="mb-5 items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-rose">
          <Ionicons name="person" size={42} color={colors.primary} />
          <View className="absolute bottom-0 left-0 h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Ionicons name="camera" size={12} color={colors.surface} />
          </View>
        </View>
      </View>
      {fields.map(field => (
        <ProfileField key={field.label} {...field} />
      ))}
      <Pressable
        className="my-5 self-start"
        onPress={() => navigation.navigate('ChangePassword')}>
        <AppText className="text-small text-primary underline">
          تغيير كلمة السر
        </AppText>
      </Pressable>
      <View className="mb-6 flex-row-reverse items-center justify-center gap-10">
        <View>
          <AppText className="text-body">النقاط 🪙</AppText>
          <AppText className="text-label mt-2">{profile.points} نقطة</AppText>
        </View>
        <View className="h-16 w-px bg-ink" />
        <QRCode
          value={profile.attendanceQrValue}
          size={70}
          color={colors.ink}
        />
      </View>
      <PrimaryButton
        label="🔗 اربط جروب الواتس اب"
        onPress={() => Alert.alert('رابط جروب الواتس اب غير متاح حالياً')}
      />
    </Screen>
  );
}
