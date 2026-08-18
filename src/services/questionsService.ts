import { apiClient } from '../api/apiClient';
import type { SubmissionResult } from '../types/api';
import type {
  KnowMeQuestion,
  QuestionAnswer,
  QuestionCategory,
  QuestionProposalResponse,
} from '../types/business';

export const questionsService = {
  async getCategories(): Promise<QuestionCategory[]> {
    const response = await apiClient.get<QuestionCategory[]>(
      '/questions/categories',
    );
    return response.data;
  },

  async getQuestions(categoryId: string): Promise<QuestionAnswer[]> {
    const response = await apiClient.get<QuestionAnswer[]>('/questions', {
      params: { categoryId },
    });
    return response.data;
  },

  async proposeQuestion(question: string): Promise<QuestionProposalResponse> {
    const response = await apiClient.post<QuestionProposalResponse>(
      '/questions/proposals',
      { question },
    );
    return response.data;
  },

  async getKnowMeQuestions(): Promise<KnowMeQuestion[]> {
    const response =
      await apiClient.get<KnowMeQuestion[]>('/questions/know-me');
    return response.data;
  },

  async submitKnowMeAnswer(
    questionId: string,
    answer: string,
  ): Promise<SubmissionResult> {
    const response = await apiClient.post<SubmissionResult>(
      `/questions/know-me/${questionId}/answers`,
      { answer },
    );
    return response.data;
  },
};
