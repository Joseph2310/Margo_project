import axios from 'axios';
import type { ApiErrorShape } from '../types/api';

export const getApiError = (error: unknown): ApiErrorShape => {
  if (axios.isAxiosError<ApiErrorShape>(error) && error.response?.data) {
    return error.response.data;
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'client_error' };
  }
  return { message: 'حدث خطأ غير متوقع', code: 'unknown_error' };
};

export const getApiErrorMessage = (error: unknown): string =>
  getApiError(error).message;
