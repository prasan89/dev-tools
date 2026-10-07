import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, isoWeek, formatDateISO } from '../datetime/dates';

export const weekNumberCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Date (YYYY-MM-DD)',
  inputPlaceholder: '2026-01-01',
  autoProcess: true,
  exampleInput: '2026-01-01',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a date.' };

    let d: Date;
    try {
      d = parseDate(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid date: ${msg}` };
    }

    const { week, year, weekStart, weekEnd } = isoWeek(d);

    const weekStartStr = formatDateISO(weekStart);
    const weekEndStr = formatDateISO(weekEnd);

    const lines: string[] = [
      `ISO Week number:  ${week}`,
      `ISO Week year:    ${year}`,
      `Week starts:      ${weekStartStr} (Monday)`,
      `Week ends:        ${weekEndStr} (Sunday)`,
      '',
      'Note: ISO 8601 — week starts Monday, week 1 contains the first Thursday of the year.',
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Week ${week} of ${year}`,
        copyable: true,
      },
      meta: {
        'iso week': week,
        'iso year': year,
        'week start': weekStartStr,
        'week end': weekEndStr,
      },
    };
  },
};
