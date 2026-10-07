import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { isLeapYear, daysInMonth } from '../datetime/dates';

function findNextLeapYear(fromYear: number): number {
  let y = fromYear + 1;
  while (!isLeapYear(y)) y++;
  return y;
}

function findPrevLeapYear(fromYear: number): number {
  let y = fromYear - 1;
  while (!isLeapYear(y)) y--;
  return y;
}

export const leapYearCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Year',
  inputPlaceholder: '2024',
  autoProcess: true,
  exampleInput: '2024',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a year or a range (e.g. 2020-2030).' };

    // Check for range format: YYYY-YYYY
    const rangeMatch = raw.match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
    if (rangeMatch) {
      const startYear = parseInt(rangeMatch[1], 10);
      const endYear = parseInt(rangeMatch[2], 10);

      if (startYear > endYear) {
        return { error: 'Start year must be less than or equal to end year.' };
      }
      if (endYear - startYear > 400) {
        return { error: 'Range too large. Please use a range of 400 years or less.' };
      }

      const leapYears: number[] = [];
      for (let y = startYear; y <= endYear; y++) {
        if (isLeapYear(y)) leapYears.push(y);
      }

      const lines: string[] = [
        `Leap years from ${startYear} to ${endYear}:`,
        '',
      ];

      if (leapYears.length === 0) {
        lines.push('  No leap years in this range.');
      } else {
        lines.push(`  Count: ${leapYears.length}`);
        lines.push('');
        // Group in rows of 10
        for (let i = 0; i < leapYears.length; i += 10) {
          lines.push('  ' + leapYears.slice(i, i + 10).join(', '));
        }
      }

      return {
        output: {
          value: lines.join('\n'),
          type: 'text',
          label: `Leap Years ${startYear}–${endYear}`,
          copyable: true,
        },
        meta: {
          'leap years found': leapYears.length,
          'range': `${startYear}–${endYear}`,
        },
      };
    }

    // Single year
    const yearMatch = raw.match(/^(\d{1,4})$/);
    if (!yearMatch) {
      return { error: 'Enter a year (e.g. 2024) or a range (e.g. 2020-2030).' };
    }

    const year = parseInt(yearMatch[1], 10);
    if (year < 1 || year > 9999) {
      return { error: 'Year must be between 1 and 9999.' };
    }

    const leap = isLeapYear(year);
    const daysInYear = leap ? 366 : 365;
    const febDays = daysInMonth(year, 2);
    const nextLeap = findNextLeapYear(year);
    const prevLeap = year > 4 ? findPrevLeapYear(year) : null;

    const lines: string[] = [
      `Year ${year}:`,
      '',
      `  Leap year:        ${leap ? 'Yes' : 'No'}`,
      `  Days in year:     ${daysInYear}`,
      `  Days in February: ${febDays}`,
      '',
      `  Next leap year:     ${nextLeap}`,
      prevLeap !== null
        ? `  Previous leap year: ${prevLeap}`
        : `  Previous leap year: N/A`,
    ];

    if (!leap) {
      const rule = year % 400 === 0
        ? 'Divisible by 400 → leap year'
        : year % 100 === 0
        ? 'Divisible by 100 but not 400 → not a leap year'
        : year % 4 === 0
        ? 'Divisible by 4 but this is not → not a leap year'
        : 'Not divisible by 4 → not a leap year';
      lines.push('', `  Rule: ${rule}`);
    } else {
      const rule = year % 400 === 0
        ? 'Divisible by 400 → leap year'
        : 'Divisible by 4 and not by 100 → leap year';
      lines.push('', `  Rule: ${rule}`);
    }

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `${year} — ${leap ? 'Leap Year' : 'Not a Leap Year'}`,
        copyable: true,
      },
      meta: {
        year,
        'leap year': leap ? 'yes' : 'no',
        'days in year': daysInYear,
        'days in february': febDays,
      },
    };
  },
};
