import type { QuestionAnswer, QuestionCategory } from '../types/business';

export interface QuestionsService {
  getCategories(): Promise<QuestionCategory[]>;
  getQuestions(categoryId: string): Promise<QuestionAnswer[]>;
  proposeQuestion(question: string): Promise<void>;
  submitKnowMeAnswer(questionId: string, answer: string): Promise<void>;
}
