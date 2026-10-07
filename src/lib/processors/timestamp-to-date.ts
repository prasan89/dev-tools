import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Same unit-detection heuristic as unix-timestamp-converter.
// Numbers with |value| >= 1e12 are treated as milliseconds.
function detectUnit(n: number): 'ms' | 's' {
  return Math.abs(n) >= 1e12 ? 'ms' : 's';
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

export const timestampToDateProcessor: ToolProcessor = {
  inputLabel: 'Timestamp',
  inputPlaceholder: 'Enter a numeric timestamp (seconds or milliseconds)…',
  autoProcess: true,
  exampleInput: '1700000000000',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a numeric timestamp to convert.' };

    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return { error: 'Not a valid number. Enter a timestamp in seconds or milliseconds.' };
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
        label: 'Date Result',
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
