import { expect } from '@playwright/test';

/* String format.
 * @param str String, needs to be formatted.
 * @param args Arguments, needs to be placed properly in the string.
 */
export const stringFormat = (str: string, ...args: unknown[]): string => {
  return str.replace(/{(\d+)}/g, (match: string, index: string) => {
    const value = args[Number(index)];
    return value !== undefined && value !== null ? String(value) : "";
  });
};