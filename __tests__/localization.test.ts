import { ar } from '../src/localization/ar';
import { en } from '../src/localization/en';
import { translate } from '../src/localization';
import {
  createLoginSchema,
  createVerificationSchema,
} from '../src/utils/validation';

describe('Arabic and English localization', () => {
  test('keeps both translation catalogs in sync', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });

  test('translates and interpolates values in both languages', () => {
    expect(translate('en', 'common.points', { count: 20 })).toBe('20 points');
    expect(translate('ar', 'common.points', { count: '٢٠' })).toBe('٢٠ نقطة');
  });

  test('builds validation messages for the active language', () => {
    const enT = (key: Parameters<typeof translate>[1]) => translate('en', key);
    const arT = (key: Parameters<typeof translate>[1]) => translate('ar', key);
    const englishLogin = createLoginSchema(enT).safeParse({
      email: 'invalid',
      password: '',
    });
    const arabicCode = createVerificationSchema(arT).safeParse({ code: '123' });

    expect(englishLogin.error?.issues[0]?.message).toBe(
      'Enter a valid email address',
    );
    expect(arabicCode.error?.issues[0]?.message).toBe(
      'أدخل الكود المكون من 6 أرقام',
    );
  });
});
