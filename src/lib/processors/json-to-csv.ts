import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

const MAX_ROWS = 100_000;

// Escape a single CSV field: wrap in quotes if it contains comma, newline, or quote.
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (typeof value === 'object') {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  // Must quote if contains comma, double-quote, newline, or carriage return
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jsonToCsv(input: string, delimiter: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('Invalid JSON — please check your input.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Input must be a JSON array of objects. Wrap a single object in [ ].');
  }
  if (parsed.length === 0) {
    return '';
  }
  if (parsed.length > MAX_ROWS) {
    throw new Error(`Input has ${parsed.length.toLocaleString()} rows — maximum is ${MAX_ROWS.toLocaleString()}.`);
  }

  // Collect all column headers (union of all object keys, preserving first-seen order)
  const headerSet = new Set<string>();
  for (const row of parsed) {
    if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
      for (const key of Object.keys(row as Record<string, unknown>)) {
        headerSet.add(key);
      }
    }
  }

  if (headerSet.size === 0) {
    throw new Error('No object keys found. Input must be a non-empty array of objects.');
  }

  const headers = Array.from(headerSet);
  const sep = delimiter === 'tab' ? '\t' : delimiter;

  const lines: string[] = [];
  // Header row — escape header names too (they could contain commas)
  lines.push(headers.map(h => escapeCsvField(h)).join(sep));

  for (const row of parsed) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      // Non-object rows: output empty row
      lines.push(headers.map(() => '').join(sep));
      continue;
    }
    const obj = row as Record<string, unknown>;
    lines.push(headers.map(h => escapeCsvField(h in obj ? obj[h] : null)).join(sep));
  }

  return lines.join('\r\n');
}

export const jsonToCsvProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste a JSON array of objects here…',
  autoProcess: true,
  exampleInput: JSON.stringify(
    [
      { name: 'Alice', age: 30, city: 'New York' },
      { name: 'Bob', age: 25, city: 'London' },
      { name: 'Charlie', age: 35, city: 'Tokyo, Japan' },
    ],
    null,
    2
  ),

  optionControls: [
    {
      key: 'delimiter',
      type: 'select',
      label: 'Delimiter',
      defaultValue: ',',
      options: [
        { value: ',', label: 'Comma (,)' },
        { value: ';', label: 'Semicolon (;)' },
        { value: 'tab', label: 'Tab' },
        { value: '|', label: 'Pipe (|)' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON array to convert.' };

    const delimiter = String(input.options?.['delimiter'] ?? ',');

    let csv: string;
    try {
      csv = jsonToCsv(raw, delimiter);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Conversion failed.' };
    }

    if (!csv) {
      return { error: 'The input array is empty — nothing to convert.' };
    }

    const rows = csv.split('\r\n').length - 1; // subtract header
    const cols = csv.split('\r\n')[0]?.split(delimiter === 'tab' ? '\t' : delimiter).length ?? 0;

    return {
      output: {
        value: csv,
        type: 'text',
        label: 'CSV Output',
        copyable: true,
        downloadFilename: 'output.csv',
        downloadMime: 'text/csv',
      },
      meta: {
        rows,
        columns: cols,
        'output bytes': csv.length,
      },
    };
  },
};
