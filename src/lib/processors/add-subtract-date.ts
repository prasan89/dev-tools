import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, formatDateISO, addToDate } from '../datetime/dates';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatLong(d: Date): string {
  const day = d.getUTCDate();
  const month = MONTH_NAMES[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const dow = DAY_NAMES[d.getUTCDay()];
  const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
  return `${dow}, ${month} ${day}${suffix}, ${year}`;
}

function formatISO8601(d: Date): string {
  // UTC date only (no time component)
  return `${formatDateISO(d)}T00:00:00Z`;
}

export const addSubtractDateProcessor: ToolProcessor = {
  inputLabel: 'Start Date',
  inputPlaceholder: 'YYYY-MM-DD (e.g. 2026-01-31)',
  autoProcess: true,
  exampleInput: '2026-01-31',

  optionControls: [
    {
      key: 'operation',
      type: 'select',
      label: 'Operation',
      defaultValue: 'Add',
      options: [
        { value: 'Add', label: 'Add' },
        { value: 'Subtract', label: 'Subtract' },
      ],
    },
    {
      key: 'years',
      type: 'text',
      label: 'Years',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'months',
      type: 'text',
      label: 'Months',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'weeks',
      type: 'text',
      label: 'Weeks',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'days',
      type: 'text',
      label: 'Days',
      defaultValue: '1',
      placeholder: '0',
    },
    {
      key: 'hours',
      type: 'text',
      label: 'Hours',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'minutes',
      type: 'text',
      label: 'Minutes',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'seconds',
      type: 'text',
      label: 'Seconds',
      defaultValue: '0',
      placeholder: '0',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a start date (YYYY-MM-DD).' };

    let startDate: Date;
    try {
      startDate = parseDate(raw);
    } catch {
      return { error: `Invalid start date: "${raw}". Use YYYY-MM-DD format.` };
    }

    const opts = input.options ?? {};
    const operation = String(opts.operation ?? 'Add');
    const sign = operation === 'Subtract' ? -1 : 1;

    function parseOpt(key: string): number {
      const val = parseInt(String(opts[key] ?? '0'), 10);
      return isNaN(val) ? 0 : val;
    }

    const years   = parseOpt('years')   * sign;
    const months  = parseOpt('months')  * sign;
    const weeks   = parseOpt('weeks')   * sign;
    const days    = parseOpt('days')    * sign;
    const hours   = parseOpt('hours')   * sign;
    const minutes = parseOpt('minutes') * sign;
    const seconds = parseOpt('seconds') * sign;

    let resultDate: Date;
    try {
      resultDate = addToDate(startDate, { years, months, weeks, days, hours, minutes, seconds });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Calculation error: ${msg}` };
    }

    const startISO = formatDateISO(startDate);
    const resultISO = formatDateISO(resultDate);

    // Detect month-end clamping: re-run without clamping to check
    const originalDay = startDate.getUTCDate();
    const naiveResultMonth = ((startDate.getUTCMonth() + 1 + months - 1 + 1200) % 12) + 1;
    const naiveResultYear  = startDate.getUTCFullYear() + years + Math.floor((startDate.getUTCMonth() + 1 + months - 1) / 12);
    const daysInTargetMonth = new Date(Date.UTC(naiveResultYear, naiveResultMonth, 0)).getUTCDate();
    const wasClamped = (months !== 0 || years !== 0) && originalDay > daysInTargetMonth;

    const lines = [
      `Start date:       ${startISO}`,
      `Operation:        ${operation} ${buildDurationLabel({ years: Math.abs(years), months: Math.abs(months), weeks: Math.abs(weeks), days: Math.abs(days), hours: Math.abs(hours), minutes: Math.abs(minutes), seconds: Math.abs(seconds) })}`,
      ``,
      `Result`,
      `  YYYY-MM-DD:     ${resultISO}`,
      `  Long format:    ${formatLong(resultDate)}`,
      `  Day of week:    ${DAY_NAMES[resultDate.getUTCDay()]}`,
      `  ISO 8601:       ${formatISO8601(resultDate)}`,
    ];

    if (wasClamped) {
      lines.push(``, `Note: Month-end clamping applied — result day adjusted to last day of the target month.`);
    }

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Result: ${resultISO}`,
        copyable: true,
      },
      meta: {
        'start date': startISO,
        'result date': resultISO,
        'day of week': DAY_NAMES[resultDate.getUTCDay()],
      },
    };
  },
};

function buildDurationLabel(parts: {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): string {
  const segments: string[] = [];
  if (parts.years)   segments.push(`${parts.years} year${parts.years === 1 ? '' : 's'}`);
  if (parts.months)  segments.push(`${parts.months} month${parts.months === 1 ? '' : 's'}`);
  if (parts.weeks)   segments.push(`${parts.weeks} week${parts.weeks === 1 ? '' : 's'}`);
  if (parts.days)    segments.push(`${parts.days} day${parts.days === 1 ? '' : 's'}`);
  if (parts.hours)   segments.push(`${parts.hours} hour${parts.hours === 1 ? '' : 's'}`);
  if (parts.minutes) segments.push(`${parts.minutes} minute${parts.minutes === 1 ? '' : 's'}`);
  if (parts.seconds) segments.push(`${parts.seconds} second${parts.seconds === 1 ? '' : 's'}`);
  return segments.length > 0 ? segments.join(', ') : '0 days';
}
