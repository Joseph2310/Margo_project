import { NativeModules, Platform } from 'react-native';

const configuredUrl = (
  globalThis as typeof globalThis & { API_BASE_URL?: string }
).API_BASE_URL;

const metroScriptUrl = (
  NativeModules.SourceCode as { scriptURL?: string } | undefined
)?.scriptURL;
const metroHost = metroScriptUrl?.match(/^https?:\/\/([^/:]+)/)?.[1];
const developmentHost =
  metroHost ?? (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');

/**
 * In development the API host follows Metro, so both Android emulators and
 * physical devices can reach the computer running Docker. A release pipeline
 * should assign global.API_BASE_URL before the app bundle is evaluated or
 * replace PRODUCTION_API_BASE_URL during environment-specific builds.
 */
const PRODUCTION_API_BASE_URL = 'https://api.example.com/api/v1';

// export const API_BASE_URL =
//   configuredUrl ??
//   (DEV ? http://${developmentHost}:8000/api/v1 : PRODUCTION_API_BASE_URL);

export const API_BASE_URL = 'http://192.168.1.5:8000/api/v1';

export const CHAT_WEBSOCKET_URL = `${API_BASE_URL.replace(
  /^http/,
  'ws',
)}/conversations/ws`;