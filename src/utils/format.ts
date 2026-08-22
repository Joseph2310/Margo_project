export const toArabicDigits = (value: number | string): string =>
  String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)] ?? digit);

export const splitTalents = (value: string): string[] =>
  value
    .split(/[،,]/)
    .map(item => item.trim())
    .filter(Boolean);

export const formatMessageTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
