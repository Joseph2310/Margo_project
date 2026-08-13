import { useQuery } from '@tanstack/react-query';
import {
  conversationsFixture,
  dailyReadingFixture,
  eventsFixture,
  questionCategoriesFixture,
  questionsFixture,
  reflectionFixture,
  spiritualActivitiesFixture,
} from '../constants/business';

const preview = async <T>(value: T): Promise<T> => value;

/**
 * Design fixtures keep the app reviewable before Swagger exists. Each query
 * keeps the final server-state boundary in place without making API calls.
 */
export const useEventsQuery = () =>
  useQuery({ queryKey: ['events'], queryFn: () => preview(eventsFixture) });

export const useDailyReadingQuery = () =>
  useQuery({
    queryKey: ['daily-reading'],
    queryFn: () => preview(dailyReadingFixture),
  });

export const useActivitiesQuery = () =>
  useQuery({
    queryKey: ['spiritual-activities'],
    queryFn: () => preview(spiritualActivitiesFixture),
  });

export const useReflectionQuery = () =>
  useQuery({
    queryKey: ['reflection'],
    queryFn: () => preview(reflectionFixture),
  });

export const useQuestionCategoriesQuery = () =>
  useQuery({
    queryKey: ['question-categories'],
    queryFn: () => preview(questionCategoriesFixture),
  });

export const useQuestionsQuery = (categoryId: string) =>
  useQuery({
    queryKey: ['questions', categoryId],
    queryFn: () =>
      preview(
        questionsFixture.filter(question => question.categoryId === categoryId),
      ),
  });

export const useConversationsQuery = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: () => preview(conversationsFixture),
  });
