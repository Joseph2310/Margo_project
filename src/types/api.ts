export interface ApiErrorShape {
  message: string;
  code: string;
  fieldErrors?: Record<string, string>;
}

export interface MessageResponse {
  message: string;
}

export interface SubmissionResult {
  id: string;
  pointsAwarded: number;
  totalPoints: number;
  message: string;
}
