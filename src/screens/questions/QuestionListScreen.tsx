import Ionicons from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { QuestionCard } from '../../components/cards/QuestionCard';
import { QueryState } from '../../components/feedback/QueryState';
import {
  useQuestionCategoriesQuery,
  useQuestionsQuery,
} from '../../providers/QuestionsProvider/hooks';
import { colors } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/navigation';
import { useLocalization } from '../../localization';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionList'>;

export function QuestionListScreen({ route, navigation }: Props) {
  const { isRTL, t } = useLocalization();
  const categories = useQuestionCategoriesQuery();
  const category = categories.data?.find(
    item => item.id === route.params.categoryId,
  );
  const questions = useQuestionsQuery(route.params.categoryId);
  return (
    <Screen>
      <AppHeader title={t('home.questionBank')} />
      <AppText className="text-label mb-4">
        {t('questions.aboutCategory', { category: category?.title ?? '' })}
      </AppText>
      <QueryState
        loading={questions.isLoading}
        error={questions.isError}
        empty={!questions.isLoading && !questions.data?.length}
        emptyLabel={t('questions.emptyCategory')}
        onRetry={() => questions.refetch()}
      />
      {questions.data?.map(item => (
        <QuestionCard
          key={item.id}
          item={item}
          accent={category?.color ?? colors.cream}
        />
      ))}
      <Pressable
        className={`mt-2 items-center gap-2 rounded-button bg-primary p-3 ${isRTL ? 'flex-row-reverse self-end' : 'flex-row self-start'}`}
        onPress={() => navigation.navigate('AddQuestion')}>
        <Ionicons name="add-circle-outline" size={24} color={colors.surface} />
        <AppText className="text-white">{t('questions.add')}</AppText>
      </Pressable>
    </Screen>
  );
}
