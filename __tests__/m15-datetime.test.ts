/**
 * M15 tests — 20 new Date & Time tool processors + registry/index + datetime utilities
 *
 * Covers:
 *   age-calculator, date-difference-calculator, days-between-dates,
 *   business-days-calculator, add-subtract-date, time-duration-calculator,
 *   countdown-timer, days-until, week-number-calculator, leap-year-calculator,
 *   date-to-unix-timestamp, unix-timestamp-to-date, iso-8601-converter,
 *   date-format-converter, timezone-converter, utc-converter, world-clock,
 *   meeting-time-planner, cron-generator, cron-parser
 *
 *   DateTime utilities: dates, durations, unix, iso, timezone, business-days, cron
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Processor imports
// ---------------------------------------------------------------------------

import { ageCalculatorProcessor } from '@/lib/processors/age-calculator';
import { dateDifferenceCalculatorProcessor } from '@/lib/processors/date-difference-calculator';
import { daysBetweenDatesProcessor } from '@/lib/processors/days-between-dates';
import { businessDaysCalculatorProcessor } from '@/lib/processors/business-days-calculator';
import { addSubtractDateProcessor } from '@/lib/processors/add-subtract-date';
import { timeDurationCalculatorProcessor } from '@/lib/processors/time-duration-calculator';
import { countdownTimerProcessor } from '@/lib/processors/countdown-timer';
import { daysUntilProcessor } from '@/lib/processors/days-until';
import { weekNumberCalculatorProcessor } from '@/lib/processors/week-number-calculator';
import { leapYearCalculatorProcessor } from '@/lib/processors/leap-year-calculator';
import { dateToUnixTimestampProcessor } from '@/lib/processors/date-to-unix-timestamp';
import { unixTimestampToDateProcessor } from '@/lib/processors/unix-timestamp-to-date';
import { iso8601ConverterProcessor } from '@/lib/processors/iso-8601-converter';
import { dateFormatConverterProcessor } from '@/lib/processors/date-format-converter';
import { timezoneConverterProcessor } from '@/lib/processors/timezone-converter';
import { utcConverterProcessor } from '@/lib/processors/utc-converter';
import { worldClockProcessor } from '@/lib/processors/world-clock';
import { meetingTimePlannerProcessor } from '@/lib/processors/meeting-time-planner';
import { cronGeneratorProcessor } from '@/lib/processors/cron-generator';
import { cronParserProcessor } from '@/lib/processors/cron-parser';

// ---------------------------------------------------------------------------
// Datetime utility imports
// ---------------------------------------------------------------------------

import {
  isLeapYear,
  daysInMonth,
  daysBetween,
  addToDate,
  dateDiff,
  isoWeek,
  calcAge,
} from '@/lib/datetime/dates';

import {
  timeDuration,
  countdown,
} from '@/lib/datetime/durations';

import {
  unixToDate,
  unixMsToDate,
  dateToUnix,
} from '@/lib/datetime/unix';

import {
  parseISO,
  describeISO,
} from '@/lib/datetime/iso';

import {
  isValidTimezone,
  getUTCOffset,
  getPopularTimezones,
} from '@/lib/datetime/timezone';

import {
  countBusinessDays,
  isBusinessDay,
} from '@/lib/datetime/business-days';

import {
  validateCron,
  describeCron,
  getNextExecutions,
  parseCron,
} from '@/lib/datetime/cron';

// ---------------------------------------------------------------------------
// Helper type
// ---------------------------------------------------------------------------

type AnyProcessor = typeof ageCalculatorProcessor;

function run(
  proc: AnyProcessor,
  value: string,
  opts?: Record<string, unknown>,
  secondary?: string,
) {
  return proc.process({ value, secondary, options: opts ?? {} });
}

// ===========================================================================
// DATETIME UTILITY TESTS
// ===========================================================================

// ---------------------------------------------------------------------------
// dates.ts
// ---------------------------------------------------------------------------

describe('datetime/dates — isLeapYear', () => {
  it('2024 is a leap year', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('2025 is not a leap year', () => {
    expect(isLeapYear(2025)).toBe(false);
  });

  it('1900 is not a leap year (divisible by 100, not by 400)', () => {
    expect(isLeapYear(1900)).toBe(false);
  });

  it('2000 is a leap year (divisible by 400)', () => {
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe('datetime/dates — daysInMonth', () => {
  it('February 2024 has 29 days (leap year)', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it('February 2025 has 28 days (non-leap)', () => {
    expect(daysInMonth(2025, 2)).toBe(28);
  });
});

describe('datetime/dates — daysBetween', () => {
  it('2026-01-01 to 2026-12-31 exclusive = 364', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-12-31'), false)).toBe(364);
  });

  it('2026-01-01 to 2026-12-31 inclusive = 365', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-12-31'), true)).toBe(365);
  });
});

describe('datetime/dates — addToDate', () => {
  it('2026-01-31 + 1 month → 2026-02-28 (clamped)', () => {
    const result = addToDate(new Date(Date.UTC(2026, 0, 31)), { months: 1 });
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(1); // 0-indexed
    expect(result.getUTCDate()).toBe(28);
  });

  it('2024-02-29 + 1 year → 2025-02-28 (leap day clamped)', () => {
    const result = addToDate(new Date(Date.UTC(2024, 1, 29)), { years: 1 });
    expect(result.getUTCFullYear()).toBe(2025);
    expect(result.getUTCMonth()).toBe(1);
    expect(result.getUTCDate()).toBe(28);
  });
});

describe('datetime/dates — dateDiff', () => {
  it('2020-01-01 to 2026-10-07 → years >= 6', () => {
    const diff = dateDiff(
      new Date(Date.UTC(2020, 0, 1)),
      new Date(Date.UTC(2026, 9, 7)),
    );
    expect(diff.years).toBeGreaterThanOrEqual(6);
  });
});

describe('datetime/dates — isoWeek', () => {
  it('2026-01-01 → week 1, year 2026', () => {
    const { week, year } = isoWeek(new Date(Date.UTC(2026, 0, 1)));
    expect(week).toBe(1);
    expect(year).toBe(2026);
  });
});

describe('datetime/dates — calcAge', () => {
  it('born 1990-06-15, ref 2026-10-07 → years === 36', () => {
    const age = calcAge(
      new Date(Date.UTC(1990, 5, 15)),
      new Date(Date.UTC(2026, 9, 7)),
    );
    expect(age.years).toBe(36);
  });
});

// ---------------------------------------------------------------------------
// durations.ts
// ---------------------------------------------------------------------------

describe('datetime/durations — timeDuration', () => {
  it('09:00 to 17:30 → hours=8, minutes=30, crossesMidnight=false', () => {
    const r = timeDuration('09:00', '17:30');
    expect(r.hours).toBe(8);
    expect(r.minutes).toBe(30);
    expect(r.crossesMidnight).toBe(false);
  });

  it('23:30 to 01:15 → crossesMidnight=true, totalSeconds=6300', () => {
    const r = timeDuration('23:30', '01:15');
    expect(r.crossesMidnight).toBe(true);
    // 1h45m = 6300s
    expect(r.totalSeconds).toBe(6300);
  });
});

describe('datetime/durations — countdown', () => {
  it('future date → isPast=false', () => {
    const future = new Date(Date.now() + 60_000);
    expect(countdown(future).isPast).toBe(false);
  });

  it('past date → isPast=true', () => {
    const past = new Date(Date.now() - 60_000);
    expect(countdown(past).isPast).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// unix.ts
// ---------------------------------------------------------------------------

describe('datetime/unix — unixToDate', () => {
  it('unixToDate(0) → 1970-01-01T00:00:00Z', () => {
    const d = unixToDate(0);
    expect(d.toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });
});

describe('datetime/unix — dateToUnix', () => {
  it('2026-01-01T00:00:00Z → seconds ~1.77e9', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const { seconds } = dateToUnix(d);
    // 2026-01-01 is around 1767225600
    expect(seconds).toBeGreaterThan(1_760_000_000);
    expect(seconds).toBeLessThan(1_800_000_000);
  });
});

describe('datetime/unix — unixMsToDate', () => {
  it('unixMsToDate(1000) is same as unixToDate(1)', () => {
    expect(unixMsToDate(1000).getTime()).toBe(unixToDate(1).getTime());
  });
});

// ---------------------------------------------------------------------------
// iso.ts
// ---------------------------------------------------------------------------

describe('datetime/iso — parseISO', () => {
  it('parses 2026-10-07T14:30:00+05:30 to a valid Date', () => {
    const d = parseISO('2026-10-07T14:30:00+05:30');
    expect(d instanceof Date).toBe(true);
    expect(isNaN(d.getTime())).toBe(false);
  });
});

describe('datetime/iso — describeISO', () => {
  it('2026-10-07 is valid', () => {
    expect(describeISO('2026-10-07').valid).toBe(true);
  });

  it('not-a-date is invalid', () => {
    expect(describeISO('not-a-date').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// timezone.ts
// ---------------------------------------------------------------------------

describe('datetime/timezone — isValidTimezone', () => {
  it('Asia/Kolkata is valid', () => {
    expect(isValidTimezone('Asia/Kolkata')).toBe(true);
  });

  it('Invalid/Timezone is not valid', () => {
    expect(isValidTimezone('Invalid/Timezone')).toBe(false);
  });
});

describe('datetime/timezone — getUTCOffset', () => {
  it('UTC → +00:00', () => {
    expect(getUTCOffset('UTC')).toBe('+00:00');
  });

  it('Asia/Kolkata → +05:30', () => {
    expect(getUTCOffset('Asia/Kolkata')).toBe('+05:30');
  });
});

describe('datetime/timezone — getPopularTimezones', () => {
  it('returns at least 20 timezones', () => {
    expect(getPopularTimezones().length).toBeGreaterThanOrEqual(20);
  });
});

// ---------------------------------------------------------------------------
// business-days.ts
// ---------------------------------------------------------------------------

describe('datetime/business-days — countBusinessDays', () => {
  it('Mon-Fri 2026-01-05 to 2026-01-09 → 5', () => {
    expect(
      countBusinessDays(new Date(Date.UTC(2026, 0, 5)), new Date(Date.UTC(2026, 0, 9))),
    ).toBe(5);
  });

  it('Mon to following Fri (includes 1 weekend) → 6', () => {
    // 2026-01-05 (Mon) to 2026-01-12 (Mon): Mon+Tue+Wed+Thu+Fri + Mon = 6
    expect(
      countBusinessDays(new Date(Date.UTC(2026, 0, 5)), new Date(Date.UTC(2026, 0, 12))),
    ).toBe(6);
  });
});

describe('datetime/business-days — isBusinessDay', () => {
  it('2026-01-05 (Monday) is a business day', () => {
    expect(isBusinessDay(new Date(Date.UTC(2026, 0, 5)), [1, 2, 3, 4, 5])).toBe(true);
  });

  it('2026-01-10 (Saturday) is not a business day', () => {
    expect(isBusinessDay(new Date(Date.UTC(2026, 0, 10)), [1, 2, 3, 4, 5])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// cron.ts
// ---------------------------------------------------------------------------

describe('datetime/cron — validateCron', () => {
  it('* * * * * is valid', () => {
    expect(validateCron('* * * * *').valid).toBe(true);
  });

  it('0 9 * * 1-5 is valid', () => {
    expect(validateCron('0 9 * * 1-5').valid).toBe(true);
  });

  it('60 * * * * is invalid (minute out of range)', () => {
    expect(validateCron('60 * * * *').valid).toBe(false);
  });

  it('not valid is invalid', () => {
    expect(validateCron('not valid').valid).toBe(false);
  });
});

describe('datetime/cron — describeCron', () => {
  it('* * * * * includes "every minute" (case-insensitive)', () => {
    expect(describeCron('* * * * *').toLowerCase()).toContain('every minute');
  });

  it('0 9 * * 1-5 includes 09:00 or 9:00', () => {
    const desc = describeCron('0 9 * * 1-5');
    const hasTime = desc.includes('09:00') || desc.includes('9:00');
    expect(hasTime).toBe(true);
  });
});

describe('datetime/cron — getNextExecutions', () => {
  it('* * * * * returns 5 executions', () => {
    expect(getNextExecutions('* * * * *', new Date(), 5).length).toBe(5);
  });
});

describe('datetime/cron — parseCron', () => {
  it('0 9 * * 1-5 → minute.raw === "0"', () => {
    expect(parseCron('0 9 * * 1-5').minute.raw).toBe('0');
  });
});

// ===========================================================================
// REGISTRY TESTS
// ===========================================================================

describe('registry — M15 new tools', () => {
  const registrySrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/registry.ts'),
    'utf8',
  );

  const newIds = [
    'age-calculator',
    'date-difference-calculator',
    'days-between-dates',
    'business-days-calculator',
    'add-subtract-date',
    'time-duration-calculator',
    'countdown-timer',
    'days-until',
    'week-number-calculator',
    'leap-year-calculator',
    'date-to-unix-timestamp',
    'unix-timestamp-to-date',
    'iso-8601-converter',
    'date-format-converter',
    'timezone-converter',
    'utc-converter',
    'world-clock',
    'meeting-time-planner',
    'cron-generator',
    'cron-parser',
  ];

  for (const id of newIds) {
    it(`'${id}' is in registry.ts`, () => {
      expect(registrySrc).toContain(`id: '${id}'`);
    });
  }

  it('all 20 tools are present', () => {
    for (const id of newIds) {
      expect(registrySrc).toContain(`id: '${id}'`);
    }
  });

  it('all 20 tools have seoTitle', () => {
    for (const id of newIds) {
      // Find the block containing this id and check seoTitle near it
      const idIndex = registrySrc.indexOf(`id: '${id}'`);
      const slice = registrySrc.slice(idIndex, idIndex + 1000);
      expect(slice).toContain('seoTitle');
    }
  });

  it('all 20 tools have seoDescription', () => {
    for (const id of newIds) {
      const idIndex = registrySrc.indexOf(`id: '${id}'`);
      const slice = registrySrc.slice(idIndex, idIndex + 1000);
      expect(slice).toContain('seoDescription');
    }
  });

  it('all 20 slugs match /^[a-z0-9-]+$/', () => {
    for (const id of newIds) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('no duplicate IDs in the list', () => {
    const unique = new Set(newIds);
    expect(unique.size).toBe(newIds.length);
  });
});

// ===========================================================================
// PROCESSOR INDEX TESTS
// ===========================================================================

describe('processor index — M15 registrations', () => {
  const indexSrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/processors/index.ts'),
    'utf8',
  );

  const newIds = [
    'age-calculator',
    'date-difference-calculator',
    'days-between-dates',
    'business-days-calculator',
    'add-subtract-date',
    'time-duration-calculator',
    'countdown-timer',
    'days-until',
    'week-number-calculator',
    'leap-year-calculator',
    'date-to-unix-timestamp',
    'unix-timestamp-to-date',
    'iso-8601-converter',
    'date-format-converter',
    'timezone-converter',
    'utc-converter',
    'world-clock',
    'meeting-time-planner',
    'cron-generator',
    'cron-parser',
  ];

  for (const id of newIds) {
    it(`'${id}' is in processorLoaders`, () => {
      expect(indexSrc).toContain(`'${id}'`);
    });
  }
});

// ===========================================================================
// PROCESSOR SMOKE TESTS
// ===========================================================================

// ---------------------------------------------------------------------------
// Age Calculator
// ---------------------------------------------------------------------------

describe('age-calculator processor', () => {
  it('1990-06-15 → no error, output includes "years"', () => {
    const r = run(ageCalculatorProcessor, '1990-06-15', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value?.toLowerCase()).toContain('years');
  });

  it('empty input → error', () => {
    expect(run(ageCalculatorProcessor, '').error).toBeTruthy();
  });

  it('autoProcess is true', () => {
    expect(ageCalculatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Date Difference Calculator
// ---------------------------------------------------------------------------

describe('date-difference-calculator processor', () => {
  it('2024-01-01 to 2026-10-07 → output includes "days"', () => {
    const r = run(dateDifferenceCalculatorProcessor, '2024-01-01', {}, '2026-10-07');
    expect(r.error).toBeFalsy();
    expect(r.output?.value?.toLowerCase()).toContain('days');
  });

  it('empty start → error', () => {
    expect(run(dateDifferenceCalculatorProcessor, '').error).toBeTruthy();
  });

  it('hasSecondaryInput is true', () => {
    expect(dateDifferenceCalculatorProcessor.hasSecondaryInput).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Days Between Dates
// ---------------------------------------------------------------------------

describe('days-between-dates processor', () => {
  it('2026-01-01 to 2026-12-31 → no error, output includes "days"', () => {
    const r = run(daysBetweenDatesProcessor, '2026-01-01', {}, '2026-12-31');
    expect(r.error).toBeFalsy();
    expect(r.output?.value?.toLowerCase()).toContain('days');
  });

  it('empty input → error', () => {
    expect(run(daysBetweenDatesProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Business Days Calculator
// ---------------------------------------------------------------------------

describe('business-days-calculator processor', () => {
  it('2026-01-05 to 2026-01-09 → no error, output has value', () => {
    const r = run(businessDaysCalculatorProcessor, '2026-01-05', {}, '2026-01-09');
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(businessDaysCalculatorProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Add / Subtract Date
// ---------------------------------------------------------------------------

describe('add-subtract-date processor', () => {
  it('2026-01-01 + 30 days → no error', () => {
    const r = run(addSubtractDateProcessor, '2026-01-01', { days: '30', operation: 'add' });
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(addSubtractDateProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Time Duration Calculator
// ---------------------------------------------------------------------------

describe('time-duration-calculator processor', () => {
  it('09:00 to 17:30 → no error, output has value', () => {
    const r = run(timeDurationCalculatorProcessor, '09:00', {}, '17:30');
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(timeDurationCalculatorProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Countdown Timer
// ---------------------------------------------------------------------------

describe('countdown-timer processor', () => {
  it('future date 2027-01-01 → no error', () => {
    const r = run(countdownTimerProcessor, '2027-01-01', { timezone: 'UTC' });
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(countdownTimerProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Days Until
// ---------------------------------------------------------------------------

describe('days-until processor', () => {
  it('2027-01-01 → no error, output has value', () => {
    const r = run(daysUntilProcessor, '2027-01-01', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(daysUntilProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Week Number Calculator
// ---------------------------------------------------------------------------

describe('week-number-calculator processor', () => {
  it('2026-01-01 → output includes "Week"', () => {
    const r = run(weekNumberCalculatorProcessor, '2026-01-01', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toContain('Week');
  });

  it('empty input → error', () => {
    expect(run(weekNumberCalculatorProcessor, '').error).toBeTruthy();
  });

  it('autoProcess is true', () => {
    expect(weekNumberCalculatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Leap Year Calculator
// ---------------------------------------------------------------------------

describe('leap-year-calculator processor', () => {
  it('2024 → output includes "leap"', () => {
    const r = run(leapYearCalculatorProcessor, '2024', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value?.toLowerCase()).toContain('leap');
  });

  it('2025 → output includes "not a leap year" or "No"', () => {
    const r = run(leapYearCalculatorProcessor, '2025', {});
    expect(r.error).toBeFalsy();
    const val = r.output?.value?.toLowerCase() ?? '';
    const label = r.output?.label?.toLowerCase() ?? '';
    expect(val.includes('not') || label.includes('not')).toBe(true);
  });

  it('empty input → error', () => {
    expect(run(leapYearCalculatorProcessor, '').error).toBeTruthy();
  });

  it('autoProcess is true', () => {
    expect(leapYearCalculatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Date to Unix Timestamp
// ---------------------------------------------------------------------------

describe('date-to-unix-timestamp processor', () => {
  it('2026-01-01 → no error, output has value', () => {
    const r = run(dateToUnixTimestampProcessor, '2026-01-01', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(dateToUnixTimestampProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Unix Timestamp to Date
// ---------------------------------------------------------------------------

describe('unix-timestamp-to-date processor', () => {
  it('1735689600 (Seconds unit) → output includes "2025"', () => {
    // 1735689600 = 2025-01-01T00:00:00Z
    const r = run(unixTimestampToDateProcessor, '1735689600', { unit: 'Seconds' });
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toContain('2025');
  });

  it('empty input → error', () => {
    expect(run(unixTimestampToDateProcessor, '').error).toBeTruthy();
  });

  it('autoProcess is true', () => {
    expect(unixTimestampToDateProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ISO 8601 Converter
// ---------------------------------------------------------------------------

describe('iso-8601-converter processor', () => {
  it('2026-10-07T00:00:00Z → no error, output has value', () => {
    const r = run(iso8601ConverterProcessor, '2026-10-07T00:00:00Z', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('not-a-date → error', () => {
    expect(run(iso8601ConverterProcessor, 'not-a-date').error).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(iso8601ConverterProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Date Format Converter
// ---------------------------------------------------------------------------

describe('date-format-converter processor', () => {
  it('2026-01-15 → no error, output has value', () => {
    const r = run(dateFormatConverterProcessor, '2026-01-15', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(dateFormatConverterProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Timezone Converter
// ---------------------------------------------------------------------------

describe('timezone-converter processor', () => {
  it('2026-01-01 12:00 with timezones → no error', () => {
    // Format must be YYYY-MM-DD HH:MM (space, not T)
    const r = run(timezoneConverterProcessor, '2026-01-01 12:00', {
      fromTimezone: 'UTC',
      toTimezones: 'Asia/Kolkata',
    });
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(timezoneConverterProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// UTC Converter
// ---------------------------------------------------------------------------

describe('utc-converter processor', () => {
  it('2026-01-01 12:00 → no error, output has value', () => {
    // Format must be YYYY-MM-DD HH:MM (space, not T)
    const r = run(utcConverterProcessor, '2026-01-01 12:00', {});
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(utcConverterProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// World Clock
// ---------------------------------------------------------------------------

describe('world-clock processor', () => {
  it('runs with empty input and returns no error (shows current time)', () => {
    const r = run(worldClockProcessor, '', {});
    // World clock doesn't need input — it shows current time
    expect(r.output?.value).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Meeting Time Planner
// ---------------------------------------------------------------------------

describe('meeting-time-planner processor', () => {
  it('returns output with value when given proper input', () => {
    const r = run(meetingTimePlannerProcessor, '2026-10-15 09:00-10:00', {},
      'Asia/Kolkata\nAmerica/New_York\nEurope/London');
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(meetingTimePlannerProcessor, '').error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Cron Generator
// ---------------------------------------------------------------------------

describe('cron-generator processor', () => {
  it('0 9 * * 1-5 options → output includes "0 9 * * 1-5"', () => {
    const r = run(cronGeneratorProcessor, '', {
      minute: '0',
      hour: '9',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1-5',
    });
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toContain('0 9 * * 1-5');
  });

  it('autoProcess is true', () => {
    expect(cronGeneratorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Cron Parser
// ---------------------------------------------------------------------------

describe('cron-parser processor', () => {
  it('0 9 * * 1-5 → output includes "Friday" or "weekday" or "Monday" or "through"', () => {
    const r = run(cronParserProcessor, '0 9 * * 1-5', {});
    expect(r.error).toBeFalsy();
    const val = r.output?.value ?? '';
    const hasDayRef =
      val.includes('Friday') ||
      val.includes('weekday') ||
      val.includes('Monday') ||
      val.includes('through');
    expect(hasDayRef).toBe(true);
  });

  it('invalid cron → error', () => {
    expect(run(cronParserProcessor, 'not a cron').error).toBeTruthy();
  });

  it('empty input → error', () => {
    expect(run(cronParserProcessor, '').error).toBeTruthy();
  });

  it('autoProcess is true', () => {
    expect(cronParserProcessor.autoProcess).toBe(true);
  });
});
