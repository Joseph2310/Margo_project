import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { Screen } from '../../components/Screen';
import { QuestionCategoryCard } from '../../components/cards/QuestionCategoryCard';
import { QueryState } from '../../components/feedback/QueryState';
import { useQuestionCategoriesQuery } from '../../providers/QuestionsProvider/hooks';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionCategories'>;

export function QuestionCategoriesScreen({ navigation }: Props) {
  const categories = useQuestionCategoriesQuery();
  return (
    <Screen>
      <AppHeader title="بنك الأسئلة" />
      <QueryState
        loading={categories.isLoading}
        error={categories.isError}
        onRetry={() => categories.refetch()}
      />
      <View className="flex-row-reverse flex-wrap justify-between">
        {categories.data?.map(category => (
          <QuestionCategoryCard
            key={category.id}
            category={category}
            onPress={() =>
              navigation.navigate('QuestionList', { categoryId: category.id })
            }
          />
        ))}
      </View>
    </Screen>
  );
}
