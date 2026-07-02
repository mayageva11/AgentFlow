export function isValidMonthFormat(month: string): boolean {
  return /^\d{2}-\d{4}$/.test(month);
}
