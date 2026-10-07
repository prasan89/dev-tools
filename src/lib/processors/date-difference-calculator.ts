import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, formatDateISO, dateDiff } from '../datetime/dates';

export const dateDifferenceCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Start Date',
  secondaryInputLabel: 'End Date',
  inputPlaceholder: 'YYYY-MM-DD (e.g. 2024-01-01)',
  hasSecondaryInput: true,
  autoProcess: true,
  exampleInput: '2024-01-01',
  exampleSecondary: '2026-10-07',

  process(input: ToolInput): ToolResult {
    const startRaw = input.value.trim();
    const endRaw = (input.secondary ?? '').trim();

    if (!startRaw) return { error: 'Enter a start date (YYYY-MM-DD).' };
    if (!endRaw) return { error: 'Enter an end date (YYYY-MM-DD).' };

    let start: Date;
    let end: Date;
    try {
      start = parseDate(startRaw);
    } catch {
      return { error: `Invalid start date: "${startRaw}". Use YYYY-MM-DD format.` };
    }
    try {
      end = parseDate(endRaw);
    } catch {
      return { error: `Invalid end date: "${endRaw}". Use YYYY-MM-DD format.` };
    }

    let swapped = false;
    if (end < start) {
      [start, end] = [end, start];
      swapped = true;
    }

    const diff = dateDiff(start, end);

    const lines: string[] = [];
    if (swapped) {
      lines.push('Note: End date is before start date — values shown as absolute difference.');
      lines.push('');
    }

    lines.push(
      `From:             ${formatDateISO(start)}`,
      `To:               ${formatDateISO(end)}`,
      ``,
      `Difference`,
      `  Years:          ${diff.years}`,
      `  Months:         ${diff.months}`,
      `  Days:           ${diff.days}`,
      ``,
      `Total`,
      `  Total days:     ${diff.totalDays.toLocaleString()}`,
      `  Total weeks:    ${diff.totalWeeks.toLocaleString()}`,
      `  Total hours:    ${diff.totalHours.toLocaleString()}`,
      `  Total minutes:  ${diff.totalMinutes.toLocaleString()}`,
    );

    const label = `${diff.years}y ${diff.months}m ${diff.days}d`;

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Difference: ${label}`,
        copyable: true,
      },
      meta: {
        years: diff.years,
        months: diff.months,
        days: diff.days,
        'total days': diff.totalDays,
      },
    };
  },
};
