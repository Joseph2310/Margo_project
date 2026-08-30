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
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';
import { useHomeQuery } from '../../providers/HomeProvider/hooks';
import { useSubmitKnowMeAnswerMutation } from '../../providers/QuestionsProvider/hooks';
import { QueryState } from '../../components/feedback/QueryState';
import { getApiErrorMessage } from '../../api/errors';
import { Alert } from 'react-native';
import { directionStyles, useLocalization } from '../../localization';

export function HomeScreen() {
  const { formatNumber, isRTL, t } = useLocalization();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const home = useHomeQuery();
  const submitAnswer = useSubmitKnowMeAnswerMutation();
  const [answer, setAnswer] = useState('');
  const profile = home.data?.profile;
  const todayQuestion = home.data?.knowMeQuestions.find(
    question => question.isToday,
  );

  const sendAnswer = async () => {
    if (!todayQuestion || !answer.trim()) return;
    try {
      await submitAnswer.mutateAsync({
        questionId: todayQuestion.id,
        answer: answer.trim(),
      });
      setAnswer('');
    } catch (error) {
      Alert.alert(t('home.sendAnswerError'), getApiErrorMessage(error, t));
    }
  };

  return (
    <Screen bottomInset={false}>
      <QueryState
        loading={home.isLoading}
        error={home.isError}
        onRetry={() => home.refetch()}
      />
      {profile ? (
        <>
          <View
            className={`mt-2 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <View
              className={`items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-rose">
                <Ionicons name="person" size={25} color={colors.primary} />
              </View>
              <View>
                <AppText className="text-caption">{t('home.welcome')}</AppText>
                <AppText className="font-bold">
                  {profile.name.split(' ')[0]}
                </AppText>
              </View>
            </View>
            <View
              className={`items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <View className="rounded-full bg-primary px-4 py-2">
                <AppText className="text-small text-white">
                  🪙{' '}
                  {t('common.points', {
                    count: formatNumber(profile.points),
                  })}
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
            title={t('home.upcomingEvents')}
            actionLabel={t('home.viewAll')}
            onAction={() => navigation.navigate('Events')}
          />
          {home.data?.upcomingEvents[0] ? (
            <Pressable
              className="rounded-card border border-event-border bg-mint-card p-4"
              onPress={() => navigation.navigate('Events')}>
              <AppText className="text-xl font-bold">
                {home.data.upcomingEvents[0].name}
              </AppText>
              <AppText className="mt-1 text-body">
                📅 {home.data.upcomingEvents[0].dateLabel}
              </AppText>
              <View
                className={`mt-8 justify-between gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <AppText className="text-caption">
                  ◷ {home.data.upcomingEvents[0].timeLabel}
                </AppText>
                <AppText numberOfLines={1} className="flex-1 text-caption">
                  ⌖ {home.data.upcomingEvents[0].location}
                </AppText>
              </View>
            </Pressable>
          ) : null}

          <SectionHeader title={t('home.dailyReading')} />
          {home.data?.dailyReading ? (
            <Pressable
              className="h-36 justify-between overflow-hidden rounded-card bg-reading p-4"
              onPress={() => navigation.navigate('DailyReading')}>
              <AppText className="text-small text-white">
                {home.data.dailyReading.title}
              </AppText>
              <View>
                <AppText className="text-xl font-bold text-white">
                  {home.data.dailyReading.reference}
                </AppText>
                <AppText className="mt-1 text-caption text-white">
                  {home.data.dailyReading.date}
                </AppText>
              </View>
            </Pressable>
          ) : null}

          <SectionHeader
            title={t('home.questionBank')}
            actionLabel={t('home.viewAll')}
            onAction={() => navigation.navigate('QuestionCategories')}
          />
          <View
            className={`${isRTL ? 'flex-row-reverse' : 'flex-row'} flex-wrap justify-between`}>
            {home.data?.questionCategories.map(category => (
              <QuestionCategoryCard
                key={category.id}
                category={category}
                onPress={() =>
                  navigation.navigate('QuestionList', {
                    categoryId: category.id,
                  })
                }
              />
            ))}
          </View>

          <View className="mt-4 rounded-card bg-white p-4">
            <View
              className={`mb-3 items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <AppText className="text-title text-primary">
                {t('home.knowMe')}
              </AppText>
              <AppText className="text-caption text-muted">
                🪙 {t('common.points', { count: formatNumber(50) })}
              </AppText>
            </View>
            {home.data?.knowMeQuestions.map(question => (
              <View
                key={question.id}
                className={`mb-2 rounded-md px-3 py-3 ${question.isToday ? 'bg-question-today' : 'border border-primary/10'}`}>
                <View
                  className={`justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <AppText className="font-medium">{question.label}</AppText>
                  {question.askedAt ? (
                    <AppText className="text-caption text-muted">
                      {question.askedAt}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ))}
            <View
              className={`mt-2 items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <TextInput
                className="h-10 flex-1 rounded-md bg-input px-3 text-ink"
                value={answer}
                onChangeText={setAnswer}
                textAlign={isRTL ? 'right' : 'left'}
                style={
                  isRTL ? directionStyles.rtlText : directionStyles.ltrText
                }
              />
              <PrimaryButton
                className="h-10 px-3"
                label={t('home.sendAnswer')}
                disabled={
                  !answer.trim() || !todayQuestion || todayQuestion.answered
                }
                loading={submitAnswer.isPending}
                onPress={sendAnswer}
              />
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}
