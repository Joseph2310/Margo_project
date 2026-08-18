export const queryKeys = {
  home: ['home'] as const,
  events: ['events'] as const,
  dailyReading: ['daily-reading'] as const,
  profile: ['profile'] as const,
  questionCategories: ['question-categories'] as const,
  questions: (categoryId: string) => ['questions', categoryId] as const,
  knowMe: ['know-me-questions'] as const,
  activities: ['retreat-activities'] as const,
  reflection: ['reflection', 'latest'] as const,
  conversations: (search = '') => ['conversations', search] as const,
  conversation: (conversationId: string) =>
    ['conversation', conversationId] as const,
  notifications: ['notifications'] as const,
};
