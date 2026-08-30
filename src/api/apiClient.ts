import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../config/environment';
import type { AuthSession } from '../types/auth';
import type { Language } from '../localization';

interface AuthHandlers {
  getAccessToken: () => string | undefined;
  getRefreshToken: () => string | undefined;
  onSession: (session: AuthSession) => void;
  onUnauthorized: () => void;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let authHandlers: AuthHandlers = {
  getAccessToken: () => undefined,
  getRefreshToken: () => undefined,
  onSession: () => undefined,
  onUnauthorized: () => undefined,
};
let refreshPromise: Promise<AuthSession> | undefined;
let apiLanguage: Language = 'ar';

export const setApiLanguage = (language: Language): void => {
  apiLanguage = language;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

export const configureApiClient = (handlers: AuthHandlers): void => {
  authHandlers = handlers;
};

apiClient.interceptors.request.use(config => {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set('Accept-Language', apiLanguage);
  const accessToken = authHandlers.getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const refreshToken = authHandlers.getRefreshToken();
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = request?.url?.includes('/auth/refresh');

    if (
      !request ||
      request._retry ||
      !isUnauthorized ||
      !refreshToken ||
      isRefreshRequest
    ) {
      if (isUnauthorized && !isRefreshRequest) authHandlers.onUnauthorized();
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshPromise ??= axios
        .post<AuthSession>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
        )
        .then(response => response.data)
        .finally(() => {
          refreshPromise = undefined;
        });
      const session = await refreshPromise;
      authHandlers.onSession(session);
      request.headers = AxiosHeaders.from(request.headers);
      request.headers.set('Authorization', `Bearer ${session.accessToken}`);
      return apiClient(request);
    } catch (refreshError) {
      authHandlers.onUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);
