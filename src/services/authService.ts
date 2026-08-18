import { apiClient } from '../api/apiClient';
import type { MessageResponse } from '../types/api';
import type {
  AuthSession,
  ChangePasswordPayload,
  LoginCredentials,
  RegistrationPayload,
  ResetPasswordPayload,
  VerificationChallenge,
  VerificationPayload,
  VerificationResult,
  VerificationMode,
} from '../types/auth';

export const authService = {
  async login(payload: LoginCredentials): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegistrationPayload): Promise<VerificationChallenge> {
    const response = await apiClient.post<VerificationChallenge>(
      '/auth/register',
      payload,
    );
    return response.data;
  },

  async verify(payload: VerificationPayload): Promise<VerificationResult> {
    const response = await apiClient.post<VerificationResult>(
      '/auth/verification/verify',
      payload,
    );
    return response.data;
  },

  async resendVerification(
    email: string,
    mode: VerificationMode,
  ): Promise<VerificationChallenge> {
    const response = await apiClient.post<VerificationChallenge>(
      '/auth/verification/resend',
      { email, mode },
    );
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<VerificationChallenge> {
    const response = await apiClient.post<VerificationChallenge>(
      '/auth/password/forgot',
      { email },
    );
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/auth/password/reset',
      payload,
    );
    return response.data;
  },

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
      '/auth/password/change',
      payload,
    );
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthSession>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
