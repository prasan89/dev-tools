import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { parseDate, formatDateISO, calcAge } from '../datetime/dates';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ageCalculatorProcessor: ToolProcessor = {
  inputLabel: 'Birth Date',
  inputPlaceholder: 'YYYY-MM-DD (e.g. 1990-06-15)',
  autoProcess: true,
  exampleInput: '1990-06-15',

  optionControls: [
    {
      key: 'referenceDate',
      type: 'text',
      label: 'Calculate age on (leave blank for today)',
      defaultValue: '',
      placeholder: 'YYYY-MM-DD',
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a birth date (YYYY-MM-DD).' };

    let birthDate: Date;
    try {
      birthDate = parseDate(raw);
    } catch {
      return { error: `Invalid birth date: "${raw}". Use YYYY-MM-DD format.` };
    }

    const refRaw = String(input.options?.referenceDate ?? '').trim();
    let referenceDate: Date;
    if (refRaw) {
      try {
        referenceDate = parseDate(refRaw);
      } catch {
        return { error: `Invalid reference date: "${refRaw}". Use YYYY-MM-DD format.` };
      }
    } else {
      const now = new Date();
      referenceDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }

    if (birthDate > referenceDate) {
      return { error: 'Birth date cannot be in the future relative to the reference date.' };
    }

    const age = calcAge(birthDate, referenceDate);

    if (age.years > 150) {
      return { error: 'Age exceeds 150 years — please check the birth date.' };
    }

    const birthdayStr = formatDateISO(birthDate);
    const refStr = formatDateISO(referenceDate);
    const birthDow = DAY_NAMES[birthDate.getUTCDay()];

    const lines = [
      `Birth Date:       ${birthdayStr} (${birthDow})`,
      `Reference Date:   ${refStr}`,
      ``,
      `Age`,
      `  Years:          ${age.years}`,
      `  Months:         ${age.months}`,
      `  Days:           ${age.days}`,
      ``,
      `Total`,
      `  Total months:   ${age.totalMonths.toLocaleString()}`,
      `  Total weeks:    ${age.totalWeeks.toLocaleString()}`,
      `  Total days:     ${age.totalDays.toLocaleString()}`,
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Age: ${age.years} year${age.years === 1 ? '' : 's'}, ${age.months} month${age.months === 1 ? '' : 's'}, ${age.days} day${age.days === 1 ? '' : 's'}`,
        copyable: true,
      },
      meta: {
        years: age.years,
        months: age.months,
        days: age.days,
        'total days': age.totalDays,
      },
    };
  },
};
