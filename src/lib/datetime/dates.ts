/**
 * Pure date utilities — no external dependencies
 */

/** Parse a date string (YYYY-MM-DD) or Date into a UTC-normalized Date */
export function parseDate(input: string | Date): Date {
  if (input instanceof Date) {
    return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  }
  const parts = input.split('-');
  if (parts.length !== 3) throw new Error(`Invalid date string: ${input}`);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format a Date as YYYY-MM-DD */
export function formatDateISO(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Get year/month/day components (1-indexed month) */
export function getComponents(d: Date): { year: number; month: number; day: number } {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/** Is leap year */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Days in a given month (1-indexed month) */
export function daysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month];
}

/** Day of year (1-365/366) */
export function dayOfYear(d: Date): number {
  const year = d.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/** ISO week number + ISO year (per ISO-8601) */
export function isoWeek(d: Date): { week: number; year: number; weekStart: Date; weekEnd: Date } {
  // ISO week: week starts on Monday, week 1 contains the first Thursday of the year
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  // Find the Thursday of this week (ISO week belongs to year containing Thursday)
  const dayOfWeekVal = date.getUTCDay(); // 0=Sun
  // Day offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const isoDay = dayOfWeekVal === 0 ? 6 : dayOfWeekVal - 1;

  // Monday of this week
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - isoDay);

  // Thursday of this week
  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);

  // Year of Thursday = ISO year
  const isoYear = thursday.getUTCFullYear();

  // First Thursday of ISO year
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const jan1Day = jan1.getUTCDay();
  const jan1IsoDay = jan1Day === 0 ? 6 : jan1Day - 1;

  // Monday of week 1
  const week1Monday = new Date(jan1);
  week1Monday.setUTCDate(jan1.getUTCDate() - jan1IsoDay);
  // But week 1 Monday can be in prev year; ensure it's <= Thursday
  // Actually the standard definition: week 1 is the week containing the first Thursday
  // So week1Monday is the Monday on or before Jan 4 of ISO year
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay();
  const jan4IsoDay = jan4Day === 0 ? 6 : jan4Day - 1;
  const correctWeek1Monday = new Date(jan4);
  correctWeek1Monday.setUTCDate(jan4.getUTCDate() - jan4IsoDay);

  const weekNum = Math.round((monday.getTime() - correctWeek1Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const weekStart = new Date(monday);
  const weekEnd = new Date(monday);
  weekEnd.setUTCDate(monday.getUTCDate() + 6);

  return { week: weekNum, year: isoYear, weekStart, weekEnd };
}

/** Day of week (0=Sun, 1=Mon ... 6=Sat) */
export function dayOfWeek(d: Date): number {
  return d.getUTCDay();
}

/**
 * Add/subtract years/months/weeks/days/hours/minutes/seconds to a date
 * Month arithmetic: if result day > days in target month, clamp to last day
 */
export function addToDate(
  d: Date,
  opts: {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }
): Date {
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth() + 1; // 1-indexed
  let day = d.getUTCDate();
  let hours = d.getUTCHours();
  let minutes = d.getUTCMinutes();
  let seconds = d.getUTCSeconds();

  if (opts.years) year += opts.years;
  if (opts.months) {
    month += opts.months;
    while (month > 12) { month -= 12; year++; }
    while (month < 1) { month += 12; year--; }
  }

  // Clamp day to days in target month
  const maxDay = daysInMonth(year, month);
  if (day > maxDay) day = maxDay;

  if (opts.weeks) day += opts.weeks * 7;
  if (opts.days) day += opts.days;
  if (opts.hours) hours += opts.hours;
  if (opts.minutes) minutes += opts.minutes;
  if (opts.seconds) seconds += opts.seconds;

  const result = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  return result;
}

/**
 * Difference between two dates in years/months/days (calendar diff, not just ms)
 * Returns positive if end > start
 */
export function dateDiff(
  start: Date,
  end: Date
): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
} {
  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(totalMs / (1000 * 60));

  let sy = start.getUTCFullYear();
  let sm = start.getUTCMonth() + 1;
  let sd = start.getUTCDate();
  const ey = end.getUTCFullYear();
  const em = end.getUTCMonth() + 1;
  const ed = end.getUTCDate();

  let years = ey - sy;
  let months = em - sm;
  let days = ed - sd;

  if (days < 0) {
    months--;
    // Days in the previous month relative to end
    let prevMonth = em - 1;
    let prevYear = ey;
    if (prevMonth < 1) { prevMonth = 12; prevYear--; }
    days += daysInMonth(prevYear, prevMonth);
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes };
}

/** Total days between two dates (end - start in whole days) */
export function daysBetween(start: Date, end: Date, inclusive = false): number {
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return inclusive ? days + 1 : days;
}

/** Count weekend days (Sat+Sun) between two dates inclusive */
export function countWeekendDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    if (dow === 0 || dow === 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** Count weekdays (Mon-Fri) between two dates inclusive */
export function countWeekdays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/**
 * Age calculation from birthDate to referenceDate
 * Returns years/months/days/totalMonths/totalWeeks/totalDays
 */
export function calcAge(
  birthDate: Date,
  referenceDate: Date
): {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
} {
  const diff = dateDiff(birthDate, referenceDate);
  const totalMonths = diff.years * 12 + diff.months;
  return {
    years: diff.years,
    months: diff.months,
    days: diff.days,
    totalMonths,
    totalWeeks: diff.totalWeeks,
    totalDays: diff.totalDays,
  };
}
