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

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionList'>;

export function QuestionListScreen({ route, navigation }: Props) {
  const categories = useQuestionCategoriesQuery();
  const category = categories.data?.find(
    item => item.id === route.params.categoryId,
  );
  const questions = useQuestionsQuery(route.params.categoryId);
  return (
    <Screen>
      <AppHeader title="بنك الأسئلة" />
      <AppText className="text-label mb-4">
        اسئلة عن {category?.title ?? ''}
      </AppText>
      <QueryState
        loading={questions.isLoading}
        error={questions.isError}
        empty={!questions.isLoading && !questions.data?.length}
        emptyLabel="لا توجد أسئلة متاحة في هذا القسم"
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
        className="mt-2 flex-row-reverse items-center gap-2 self-start rounded-button bg-primary p-3"
        onPress={() => navigation.navigate('AddQuestion')}>
        <Ionicons name="add-circle-outline" size={24} color={colors.surface} />
        <AppText className="text-white">إضافة سؤال</AppText>
      </Pressable>
    </Screen>
  );
}
