import axios from 'axios';

/**
 * The base URL is deliberately unset. Configure it only after the backend
 * contract is supplied; no endpoint or environment was present in the source.
 */
export const apiClient = axios.create({
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

export const configureApiClient = (
  baseURL: string,
  accessToken?: string,
): void => {
  apiClient.defaults.baseURL = baseURL;
  apiClient.defaults.headers.common.Authorization = accessToken
    ? `Bearer ${accessToken}`
    : undefined;
};
