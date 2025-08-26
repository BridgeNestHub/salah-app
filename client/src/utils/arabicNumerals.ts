/**
 * Converts Western Arabic numerals (0-9) to Arabic-Indic numerals (٠-٩)
 * Used in Quranic text for verse numbers
 */

const arabicNumeralMap: { [key: string]: string } = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩'
};

/**
 * Converts a number or string to Arabic-Indic numerals
 * @param value - The number or string to convert
 * @returns The value with Arabic-Indic numerals
 */
export const toArabicNumerals = (value: number | string): string => {
  return value.toString().replace(/[0-9]/g, (digit) => arabicNumeralMap[digit] || digit);
};

/**
 * Converts Arabic-Indic numerals back to Western Arabic numerals
 * @param value - The string with Arabic-Indic numerals
 * @returns The value with Western Arabic numerals
 */
export const fromArabicNumerals = (value: string): string => {
  const reverseMap: { [key: string]: string } = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9'
  };
  
  return value.replace(/[٠-٩]/g, (digit) => reverseMap[digit] || digit);
};