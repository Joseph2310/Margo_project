import {
  formatMessageTime,
  splitTalents,
  toArabicDigits,
} from '../src/utils/format';

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

  test('formats persisted message timestamps and tolerates invalid input', () => {
    expect(formatMessageTime('invalid')).toBe('');
    expect(formatMessageTime('2026-08-22T12:30:00.000Z')).toBeTruthy();
  });
});
