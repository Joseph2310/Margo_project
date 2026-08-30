import { ar } from './ar';
import { en, type TranslationKey } from './en';
import type { Language, TranslationParams } from './types';

const translations = { ar, en } as const;

export type Translate = (
  key: TranslationKey,
  params?: TranslationParams,
) => string;

export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const template = translations[language][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (token, name: string) =>
    params[name] === undefined ? token : String(params[name]),
  );
}
