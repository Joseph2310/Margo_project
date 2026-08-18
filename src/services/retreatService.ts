import { apiClient } from '../api/apiClient';
import type { SubmissionResult } from '../types/api';
import type {
  ReflectionLesson,
  RetreatSubmissionPayload,
  SpiritualActivity,
} from '../types/business';

export const retreatService = {
  async getActivities(): Promise<SpiritualActivity[]> {
    const response = await apiClient.get<SpiritualActivity[]>(
      '/retreat/activities',
    );
    return response.data;
  },

  async submit(payload: RetreatSubmissionPayload): Promise<SubmissionResult> {
    const response = await apiClient.post<SubmissionResult>(
      '/retreat/submissions',
      payload,
    );
    return response.data;
  },

  async getLatestReflection(): Promise<ReflectionLesson | undefined> {
    const response = await apiClient.get<ReflectionLesson | null>(
      '/retreat/reflection/latest',
    );
    return response.data ?? undefined;
  },

  async completeReflection(lessonId: string): Promise<SubmissionResult> {
    const response = await apiClient.post<SubmissionResult>(
      `/retreat/reflection/${lessonId}/complete`,
    );
    return response.data;
  },
};
