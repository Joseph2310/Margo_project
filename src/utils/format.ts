import type { Language } from '../localization';

export const toArabicDigits = (value: number | string): string =>
  String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)] ?? digit);

export const toLocalizedDigits = (
  value: number | string,
  language: Language,
): string => (language === 'ar' ? toArabicDigits(value) : String(value));

export const splitTalents = (value: string): string[] =>
  value
    .split(/[،,]/)
    .map(item => item.trim())
    .filter(Boolean);

export const formatMessageTime = (
  value: string,
  language: Language = 'ar',
): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMonthYear = (value: Date, language: Language): string =>
  new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(value);

export const formatWeekdayNarrow = (value: Date, language: Language): string =>
  new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'narrow',
  }).format(value);
