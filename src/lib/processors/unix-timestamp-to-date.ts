import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { unixToDate, unixMsToDate, formatDateMultiple } from '../datetime/unix';

const SECONDS_THRESHOLD = 1e10; // If > 10 billion, likely milliseconds

function detectUnit(value: number, userUnit: string): 'seconds' | 'milliseconds' {
  if (userUnit === 'Seconds') return 'seconds';
  if (userUnit === 'Milliseconds') return 'milliseconds';
  // Auto-detect
  return value > SECONDS_THRESHOLD ? 'milliseconds' : 'seconds';
}

export const unixTimestampToDateProcessor: ToolProcessor = {
  inputLabel: 'Unix Timestamp',
  inputPlaceholder: '1735689600',
  autoProcess: true,
  exampleInput: '1735689600',

  optionControls: [
    {
      key: 'unit',
      type: 'select',
      label: 'Unit',
      defaultValue: 'Auto-detect',
      options: [
        { value: 'Auto-detect', label: 'Auto-detect' },
        { value: 'Seconds', label: 'Seconds' },
        { value: 'Milliseconds', label: 'Milliseconds' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a Unix timestamp.' };

    // Accept only digits (and optional negative sign)
    if (!/^-?\d+$/.test(raw)) {
      return { error: 'Unix timestamp must be an integer number.' };
    }

    const value = parseInt(raw, 10);
    if (isNaN(value)) return { error: 'Invalid number.' };

    const userUnit = (input.options?.unit as string) || 'Auto-detect';
    const resolvedUnit = detectUnit(Math.abs(value), userUnit);

    let date: Date;
    if (resolvedUnit === 'milliseconds') {
      date = unixMsToDate(value);
    } else {
      date = unixToDate(value);
    }

    if (isNaN(date.getTime())) {
      return { error: 'Timestamp is out of valid range.' };
    }

    const formatted = formatDateMultiple(date);

    const detectionNote =
      userUnit === 'Auto-detect'
        ? `  (auto-detected as ${resolvedUnit})`
        : '';

    const unixSeconds = resolvedUnit === 'milliseconds' ? Math.floor(value / 1000) : value;
    const unixMs = resolvedUnit === 'milliseconds' ? value : value * 1000;

    const lines: string[] = [
      `Local:         ${formatted.local}`,
      `UTC:           ${formatted.utc}`,
      `ISO 8601:      ${formatted.iso}`,
      `Human:         ${formatted.human}`,
      `Unix seconds:  ${unixSeconds}`,
      `Unix ms:       ${unixMs}`,
    ];

    if (detectionNote) {
      lines.push('');
      lines.push(detectionNote.trim());
    }

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Timestamp → ${formatted.utc} UTC`,
        copyable: true,
      },
      meta: {
        'unit': resolvedUnit,
        'unix seconds': unixSeconds,
        'unix ms': unixMs,
        utc: formatted.utc,
      },
    };
  },
};
