import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, daysBetween, countWeekdays, countWeekendDays } from '../datetime/dates';

export const daysUntilProcessor: ToolProcessor = {
  inputLabel: 'Target Date (YYYY-MM-DD)',
  inputPlaceholder: '2027-01-01',
  autoProcess: true,
  exampleInput: '2027-01-01',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a target date.' };

    let target: Date;
    try {
      target = parseDate(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid date: ${msg}` };
    }

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const diff = daysBetween(todayUTC, target);

    if (diff === 0) {
      return {
        output: {
          value: "That's today!",
          type: 'text',
          label: 'Days Until',
          copyable: true,
        },
        meta: { 'days remaining': 0 },
      };
    }

    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const weeks = Math.floor(absDiff / 7);
      const remainingDays = absDiff % 7;

      const lines: string[] = [
        `${absDiff} day${absDiff !== 1 ? 's' : ''} ago`,
        '',
        `  Weeks:         ${weeks} week${weeks !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`,
        `  Total days:    ${absDiff}`,
      ];

      return {
        output: {
          value: lines.join('\n'),
          type: 'text',
          label: 'Days Since',
          copyable: true,
        },
        meta: {
          'days ago': absDiff,
          weeks,
          'remaining days': remainingDays,
        },
      };
    }

    // Future date
    const weeks = Math.floor(diff / 7);
    const remainingDays = diff % 7;

    // Count weekdays and weekends from today (exclusive) to target (inclusive)
    const dayAfterToday = new Date(todayUTC);
    dayAfterToday.setUTCDate(todayUTC.getUTCDate() + 1);

    let weekdaysRemaining = 0;
    let weekendsRemaining = 0;

    if (diff > 0) {
      weekdaysRemaining = countWeekdays(dayAfterToday, target);
      weekendsRemaining = countWeekendDays(dayAfterToday, target);
    }

    const lines: string[] = [
      `${diff} day${diff !== 1 ? 's' : ''} remaining (${weeks} week${weeks !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''})`,
      '',
      `  Total days:          ${diff}`,
      `  Weekdays remaining:  ${weekdaysRemaining}`,
      `  Weekend days:        ${weekendsRemaining}`,
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'Days Until',
        copyable: true,
      },
      meta: {
        'days remaining': diff,
        weeks,
        'weekdays remaining': weekdaysRemaining,
        'weekend days': weekendsRemaining,
      },
    };
  },
};
