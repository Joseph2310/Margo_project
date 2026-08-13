import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { QuestionCategoryCard } from '../../components/cards/QuestionCategoryCard';
import {
  knowMeQuestionsFixture,
  questionCategoriesFixture,
} from '../../constants/business';
import {
  useDailyReadingQuery,
  useEventsQuery,
} from '../../hooks/useDesignContent';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useAppSelector(state => state.profile.beneficiary);
  const events = useEventsQuery();
  const reading = useDailyReadingQuery();
  const [answer, setAnswer] = useState('');

  return (
    <Screen bottomInset={false}>
      <View className="mt-2 flex-row-reverse items-center justify-between">
        <View className="flex-row-reverse items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-rose">
            <Ionicons name="person" size={25} color={colors.primary} />
          </View>
          <View>
            <AppText className="text-caption">مرحبا بك</AppText>
            <AppText className="font-bold">
              {profile.name.split(' ')[0]}
            </AppText>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-primary px-4 py-2">
            <AppText className="text-small text-white">
              🪙 {profile.points} نقطة
            </AppText>
          </View>
          <QRCode
            value={profile.attendanceQrValue}
            size={44}
            color={colors.ink}
          />
        </View>
      </View>

      <SectionHeader
        title="الاحداث القادمة"
        actionLabel="عرض الكل"
        onAction={() => navigation.navigate('Events')}
      />
      {events.data?.[0] ? (
        <Pressable
          className="rounded-card border border-event-border bg-mint-card p-4"
          onPress={() => navigation.navigate('Events')}>
          <AppText className="text-xl font-bold">{events.data[0].name}</AppText>
          <AppText className="mt-1 text-body">
            📅 {events.data[0].dateLabel}
          </AppText>
          <View className="mt-8 flex-row-reverse justify-between gap-2">
            <AppText className="text-caption">
              ◷ {events.data[0].timeLabel}
            </AppText>
            <AppText numberOfLines={1} className="flex-1 text-caption">
              ⌖ {events.data[0].location}
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <SectionHeader title="قراءة اليوم" />
      {reading.data ? (
        <Pressable
          className="h-36 justify-between overflow-hidden rounded-card bg-reading p-4"
          onPress={() => navigation.navigate('DailyReading')}>
          <AppText className="text-small text-white">
            {reading.data.title}
          </AppText>
          <View>
            <AppText className="text-xl font-bold text-white">
              {reading.data.reference}
            </AppText>
            <AppText className="mt-1 text-caption text-white">
              {reading.data.date}
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <SectionHeader
        title="بنك الاسئلة"
        actionLabel="عرض الكل"
        onAction={() => navigation.navigate('QuestionCategories')}
      />
      <View className="flex-row-reverse flex-wrap justify-between">
        {questionCategoriesFixture.slice(0, 6).map(category => (
          <QuestionCategoryCard
            key={category.id}
            category={category}
            onPress={() =>
              navigation.navigate('QuestionList', { categoryId: category.id })
            }
          />
        ))}
      </View>

      <View className="mt-4 rounded-card bg-white p-4">
        <View className="mb-3 flex-row-reverse items-center justify-between">
          <AppText className="text-title text-primary">🧠 تعرفيني ؟ 🕊️</AppText>
          <AppText className="text-caption text-muted">🪙 50 نقطة</AppText>
        </View>
        {knowMeQuestionsFixture.map(question => (
          <View
            key={question.id}
            className={`mb-2 rounded-md px-3 py-3 ${question.isToday ? 'bg-question-today' : 'border border-primary/10'}`}>
            <View className="flex-row-reverse justify-between">
              <AppText className="font-medium">{question.label}</AppText>
              {question.askedAt ? (
                <AppText className="text-caption text-muted">
                  {question.askedAt}
                </AppText>
              ) : null}
            </View>
          </View>
        ))}
        <View className="mt-2 flex-row-reverse items-center gap-3">
          <TextInput
            className="h-10 flex-1 rounded-md bg-input px-3 text-right text-ink"
            value={answer}
            onChangeText={setAnswer}
          />
          <PrimaryButton
            className="h-10 px-3"
            label="إرسال الاجابة"
            disabled={!answer.trim()}
            onPress={() => setAnswer('')}
          />
        </View>
      </View>
    </Screen>
  );
}
