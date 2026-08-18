import { NativeModules, Platform } from 'react-native';

const configuredUrl = (
  globalThis as typeof globalThis & { __API_BASE_URL__?: string }
).__API_BASE_URL__;

const metroScriptUrl = (
  NativeModules.SourceCode as { scriptURL?: string } | undefined
)?.scriptURL;
const metroHost = metroScriptUrl?.match(/^https?:\/\/([^/:]+)/)?.[1];
const developmentHost =
  metroHost ?? (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');

/**
 * In development the API host follows Metro, so both Android emulators and
 * physical devices can reach the computer running Docker. A release pipeline
 * should assign global.__API_BASE_URL__ before the app bundle is evaluated or
 * replace PRODUCTION_API_BASE_URL during environment-specific builds.
 */
const PRODUCTION_API_BASE_URL = 'https://api.example.com/api/v1';

export const API_BASE_URL =
  configuredUrl ??
  (__DEV__ ? `http://${developmentHost}:8000/api/v1` : PRODUCTION_API_BASE_URL);
