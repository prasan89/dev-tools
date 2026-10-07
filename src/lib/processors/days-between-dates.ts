import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, formatDateISO, daysBetween, countWeekendDays, countWeekdays } from '../datetime/dates';

export const daysBetweenDatesProcessor: ToolProcessor = {
  inputLabel: 'Start Date',
  secondaryInputLabel: 'End Date',
  inputPlaceholder: 'YYYY-MM-DD (e.g. 2026-01-01)',
  hasSecondaryInput: true,
  autoProcess: true,
  exampleInput: '2026-01-01',
  exampleSecondary: '2026-12-31',

  optionControls: [
    {
      key: 'counting',
      type: 'select',
      label: 'Counting method',
      defaultValue: 'Exclusive (default)',
      options: [
        { value: 'Exclusive (default)', label: 'Exclusive (default)' },
        { value: 'Inclusive (count both endpoints)', label: 'Inclusive (count both endpoints)' },
      ],
    },
  ],

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

    // Ensure start <= end
    let swapped = false;
    if (end < start) {
      [start, end] = [end, start];
      swapped = true;
    }

    const countingOpt = String(input.options?.counting ?? 'Exclusive (default)');
    const inclusive = countingOpt.startsWith('Inclusive');

    const totalDays = daysBetween(start, end, inclusive);

    // For weekend/weekday counts always count inclusively between the two dates
    const weekendDays = countWeekendDays(start, end);
    const weekdays = countWeekdays(start, end);

    // Adjust for exclusive counting (subtract endpoints)
    const adjustedWeekendDays = inclusive ? weekendDays : weekendDays - (isWeekend(start) ? 1 : 0) - (isWeekend(end) && end.getTime() !== start.getTime() ? 1 : 0);
    const adjustedWeekdays = totalDays - (adjustedWeekendDays < 0 ? 0 : adjustedWeekendDays);

    const countingNote = inclusive
      ? 'Inclusive counting — both start and end dates are counted.'
      : 'Exclusive counting — start date counted, end date excluded.';

    const lines: string[] = [];
    if (swapped) {
      lines.push('Note: Dates were swapped (end was before start).');
      lines.push('');
    }
    lines.push(
      `From:             ${formatDateISO(start)}`,
      `To:               ${formatDateISO(end)}`,
      `Method:           ${countingNote}`,
      ``,
      `Total days:       ${totalDays.toLocaleString()}`,
      `Total weeks:      ${(totalDays / 7).toFixed(2)} (${Math.floor(totalDays / 7)} complete weeks + ${totalDays % 7} days)`,
      ``,
      `Breakdown`,
      `  Weekend days:   ${adjustedWeekendDays < 0 ? 0 : adjustedWeekendDays}`,
      `  Weekdays:       ${adjustedWeekdays < 0 ? 0 : adjustedWeekdays}`,
    );

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `${totalDays.toLocaleString()} day${totalDays === 1 ? '' : 's'} between dates`,
        copyable: true,
      },
      meta: {
        'total days': totalDays,
        weekdays: adjustedWeekdays < 0 ? 0 : adjustedWeekdays,
        'weekend days': adjustedWeekendDays < 0 ? 0 : adjustedWeekendDays,
      },
    };
  },
};

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}
