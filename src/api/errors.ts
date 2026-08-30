import axios from 'axios';
import type { ApiErrorShape } from '../types/api';
import {
  translate,
  type Translate,
  type TranslationKey,
} from '../localization';

const apiErrorKeys: Record<string, TranslationKey> = {
  validation_error: 'errors.validation_error',
  authentication_required: 'errors.authentication_required',
  account_unavailable: 'errors.account_unavailable',
  email_already_registered: 'errors.email_already_registered',
  verification_invalid: 'errors.verification_invalid',
  verification_expired: 'errors.verification_expired',
  verification_locked: 'errors.verification_locked',
  account_not_found: 'errors.account_not_found',
  invalid_credentials: 'errors.invalid_credentials',
  account_disabled: 'errors.account_disabled',
  account_not_verified: 'errors.account_not_verified',
  current_password_invalid: 'errors.current_password_invalid',
  invalid_token: 'errors.invalid_token',
  invalid_token_type: 'errors.invalid_token_type',
  refresh_token_revoked: 'errors.refresh_token_revoked',
  invalid_reset_token: 'errors.invalid_reset_token',
  category_not_found: 'errors.category_not_found',
  question_not_found: 'errors.question_not_found',
  question_already_answered: 'errors.question_already_answered',
  notification_not_found: 'errors.notification_not_found',
  invalid_activity: 'errors.invalid_activity',
  reflection_not_found: 'errors.reflection_not_found',
  reflection_already_completed: 'errors.reflection_already_completed',
  conversation_not_found: 'errors.conversation_not_found',
  conversation_blocked: 'errors.conversation_blocked',
  whatsapp_group_unavailable: 'errors.whatsapp_group_unavailable',
  house_conversation_managed: 'errors.house_conversation_managed',
  verification_delivery_unavailable: 'errors.verification_delivery_unavailable',
  verification_delivery_failed: 'errors.verification_delivery_failed',
};

export const getApiError = (error: unknown): ApiErrorShape => {
  if (axios.isAxiosError<ApiErrorShape>(error) && error.response?.data) {
    return error.response.data;
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'client_error' };
  }
  return {
    message: translate('ar', 'errors.unexpected'),
    code: 'unknown_error',
  };
};

export const getApiErrorMessage = (
  error: unknown,
  t: Translate = (key, params) => translate('ar', key, params),
): string => {
  if (axios.isAxiosError(error) && !error.response) return t('errors.network');
  const apiError = getApiError(error);
  const key = apiErrorKeys[apiError.code];
  if (key) return t(key);
  if (apiError.code === 'client_error') return apiError.message;
  return t('errors.unexpected');
};
