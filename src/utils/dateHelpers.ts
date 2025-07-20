/**
 * Date utility functions that handle timezone correctly
 */

/**
 * Get today's date in local timezone as YYYY-MM-DD string
 * This ensures we get the user's local date, not UTC
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a specific date in local timezone as YYYY-MM-DD string
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD date string into a Date object in local timezone
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if a date string represents today in local timezone
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayLocalDate();
}

/**
 * Get the start and end dates for a month in local timezone
 */
export function getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    startDate: getLocalDateString(startDate),
    endDate: getLocalDateString(endDate)
  };
}