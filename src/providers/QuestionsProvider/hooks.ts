import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsService } from '../../services/questionsService';
import { queryKeys } from '../queryKeys';

export const useQuestionCategoriesQuery = () =>
  useQuery({
    queryKey: queryKeys.questionCategories,
    queryFn: questionsService.getCategories,
  });

export const useQuestionsQuery = (categoryId: string) =>
  useQuery({
    queryKey: queryKeys.questions(categoryId),
    queryFn: () => questionsService.getQuestions(categoryId),
    enabled: Boolean(categoryId),
  });

export const useKnowMeQuestionsQuery = () =>
  useQuery({
    queryKey: queryKeys.knowMe,
    queryFn: questionsService.getKnowMeQuestions,
  });

export const useProposeQuestionMutation = () =>
  useMutation({ mutationFn: questionsService.proposeQuestion });

export const useSubmitKnowMeAnswerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      answer,
    }: {
      questionId: string;
      answer: string;
    }) => questionsService.submitKnowMeAnswer(questionId, answer),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.home }),
        queryClient.invalidateQueries({ queryKey: queryKeys.knowMe }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);
    },
  });
};
