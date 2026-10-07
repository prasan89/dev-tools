import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Auto-detect whether a numeric value is in seconds or milliseconds.
// Heuristic: Unix ms timestamps are ~13 digits for dates between 2001–2286.
// Unix s  timestamps are ~10 digits for the same range.
function detectUnit(n: number): 'ms' | 's' {
  const absN = Math.abs(n);
  // If the value is between 1e12 and 1e15, it's almost certainly milliseconds
  if (absN >= 1e12) return 'ms';
  return 's';
}

function formatDate(ts: number): { utc: string; local: string; iso: string } {
  const d = new Date(ts);
  if (isNaN(d.getTime())) throw new Error('Invalid date');
  return {
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    iso: d.toISOString(),
  };
}

export const unixTimestampConverterProcessor: ToolProcessor = {
  inputLabel: 'Unix Timestamp',
  inputPlaceholder: 'Enter a Unix timestamp (seconds or ms)…',
  autoProcess: true,
  exampleInput: '1700000000',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a Unix timestamp to convert.' };

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return { error: 'Not a valid number. Enter a Unix timestamp in seconds or milliseconds.' };
    }

    const unit = detectUnit(n);
    const tsMs = unit === 'ms' ? n : n * 1000;

    let formatted: { utc: string; local: string; iso: string };
    try {
      formatted = formatDate(tsMs);
    } catch {
      return { error: 'The timestamp is out of range for a valid date.' };
    }

    const output = [
      `UTC:      ${formatted.utc}`,
      `Local:    ${formatted.local}`,
      `ISO 8601: ${formatted.iso}`,
    ].join('\n');

    return {
      output: {
        value: output,
        type: 'text',
        label: 'Converted Date',
        copyable: true,
      },
      meta: {
        input: n,
        unit: unit === 'ms' ? 'milliseconds (auto-detected)' : 'seconds (auto-detected)',
        'unix ms': tsMs,
      },
    };
  },
};
