import { splitTalents, toArabicDigits } from '../src/utils/format';

describe('Arabic-first formatting', () => {
  test('renders timer values with Arabic digits', () => {
    expect(toArabicDigits(60)).toBe('٦٠');
  });

  test('normalizes Arabic and Latin talent separators', () => {
    expect(splitTalents('السباحة، القراءة, الرسم')).toEqual([
      'السباحة',
      'القراءة',
      'الرسم',
    ]);
  });
});
