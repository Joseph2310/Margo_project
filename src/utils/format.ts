export const toArabicDigits = (value: number | string): string =>
  String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)] ?? digit);

export const splitTalents = (value: string): string[] =>
  value
    .split(/[،,]/)
    .map(item => item.trim())
    .filter(Boolean);
