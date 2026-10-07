/**
 * Business day utilities — no external dependencies
 */

import { formatDateISO } from './dates';

const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri (ISO: Mon=1)

/** Convert JS getUTCDay() (0=Sun) to ISO day (Mon=1, ..., Sun=7) */
function jsToISODay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Count business days between two dates (inclusive of both endpoints)
 * workDays: array of ISO day numbers Mon=1 ... Sun=7 (default [1,2,3,4,5])
 * holidays: array of "YYYY-MM-DD" strings to exclude
 */
export function countBusinessDays(
  start: Date,
  end: Date,
  workDays: number[] = DEFAULT_WORK_DAYS,
  holidays: string[] = []
): number {
  const holidaySet = new Set(holidays);
  let count = 0;
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (cur <= endDate) {
    const isoDay = jsToISODay(cur.getUTCDay());
    const dateStr = formatDateISO(cur);
    if (workDays.includes(isoDay) && !holidaySet.has(dateStr)) {
      count++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/**
 * Add N business days to a date
 * workDays: array of ISO day numbers Mon=1 ... Sun=7 (default [1,2,3,4,5])
 * holidays: array of "YYYY-MM-DD" strings to exclude
 */
export function addBusinessDays(
  start: Date,
  n: number,
  workDays: number[] = DEFAULT_WORK_DAYS,
  holidays: string[] = []
): Date {
  const holidaySet = new Set(holidays);
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  let remaining = Math.abs(n);
  const direction = n >= 0 ? 1 : -1;

  if (n === 0) return cur;

  while (remaining > 0) {
    cur.setUTCDate(cur.getUTCDate() + direction);
    const isoDay = jsToISODay(cur.getUTCDay());
    const dateStr = formatDateISO(cur);
    if (workDays.includes(isoDay) && !holidaySet.has(dateStr)) {
      remaining--;
    }
  }

  return cur;
}

/**
 * Is a given date a business day?
 * workDays: array of ISO day numbers Mon=1 ... Sun=7 (default [1,2,3,4,5])
 * holidays: array of "YYYY-MM-DD" strings to exclude
 */
export function isBusinessDay(
  d: Date,
  workDays: number[] = DEFAULT_WORK_DAYS,
  holidays: string[] = []
): boolean {
  const isoDay = jsToISODay(d.getUTCDay());
  const dateStr = formatDateISO(d);
  return workDays.includes(isoDay) && !new Set(holidays).has(dateStr);
}
