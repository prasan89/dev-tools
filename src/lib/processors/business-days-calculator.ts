import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, formatDateISO, daysBetween, countWeekendDays } from '../datetime/dates';
import { countBusinessDays } from '../datetime/business-days';

export const businessDaysCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Start Date',
  secondaryInputLabel: 'End Date',
  inputPlaceholder: 'YYYY-MM-DD (e.g. 2026-01-01)',
  hasSecondaryInput: true,
  autoProcess: true,
  exampleInput: '2026-01-01',
  exampleSecondary: '2026-12-31',

  optionControls: [
    {
      key: 'workWeek',
      type: 'select',
      label: 'Work week',
      defaultValue: 'Mon–Fri (default)',
      options: [
        { value: 'Mon–Fri (default)', label: 'Mon–Fri (default)' },
        { value: 'Mon–Sat', label: 'Mon–Sat' },
        { value: 'Custom', label: 'Custom' },
      ],
    },
    {
      key: 'customWorkDays',
      type: 'text',
      label: 'Custom work days (e.g. 1,2,3,4,5 for Mon–Fri)',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
      showWhen: { key: 'workWeek', value: 'Custom' },
    },
    {
      key: 'holidays',
      type: 'textarea',
      label: 'Holidays to exclude (YYYY-MM-DD, one per line)',
      defaultValue: '',
      placeholder: '2026-01-01\n2026-12-25',
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

    let swapped = false;
    if (end < start) {
      [start, end] = [end, start];
      swapped = true;
    }

    // Resolve work days (ISO: Mon=1 ... Sun=7)
    const workWeekOpt = String(input.options?.workWeek ?? 'Mon–Fri (default)');
    let workDays: number[];
    if (workWeekOpt === 'Mon–Sat') {
      workDays = [1, 2, 3, 4, 5, 6];
    } else if (workWeekOpt === 'Custom') {
      const customRaw = String(input.options?.customWorkDays ?? '1,2,3,4,5');
      workDays = customRaw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n >= 1 && n <= 7);
      if (workDays.length === 0) {
        return { error: 'Custom work days must be a comma-separated list of numbers 1–7 (Mon–Sun).' };
      }
    } else {
      workDays = [1, 2, 3, 4, 5];
    }

    // Parse holidays
    const holidaysRaw = String(input.options?.holidays ?? '');
    const holidays: string[] = holidaysRaw
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));

    const businessDays = countBusinessDays(start, end, workDays, holidays);
    const totalCalendarDays = daysBetween(start, end, true); // inclusive
    const weekendDays = countWeekendDays(start, end);
    const weekdaysInRange = totalCalendarDays - weekendDays;

    const workWeekLabel =
      workWeekOpt === 'Custom'
        ? `Custom (days: ${workDays.join(', ')})`
        : workWeekOpt;

    const lines: string[] = [];
    if (swapped) {
      lines.push('Note: Dates were swapped (end was before start).');
      lines.push('');
    }
    lines.push(
      `From:                  ${formatDateISO(start)}`,
      `To:                    ${formatDateISO(end)}`,
      `Work week:             ${workWeekLabel}`,
      `Holidays excluded:     ${holidays.length}`,
      ``,
      `Business days:         ${businessDays.toLocaleString()}`,
      `Total calendar days:   ${totalCalendarDays.toLocaleString()}`,
      `Weekend days:          ${weekendDays.toLocaleString()}`,
      `Weekdays (Mon–Fri):    ${weekdaysInRange.toLocaleString()}`,
    );

    if (holidays.length > 0) {
      lines.push(``, `Excluded holidays:`);
      holidays.forEach((h) => lines.push(`  ${h}`));
    }

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `${businessDays.toLocaleString()} business day${businessDays === 1 ? '' : 's'}`,
        copyable: true,
      },
      meta: {
        'business days': businessDays,
        'calendar days': totalCalendarDays,
        'weekend days': weekendDays,
        'holidays excluded': holidays.length,
      },
    };
  },
};
