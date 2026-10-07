import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

const MAX_INPUT_BYTES = 10_000_000; // 10 MB

// RFC 4180-compliant CSV parser that handles:
// - quoted fields (including commas and newlines inside quotes)
// - double-quote escaping ("")
// - CRLF and LF line endings
// - trailing commas
// - missing fields on short rows
function parseCsv(text: string, delimiter: string): string[][] {
  const sep = delimiter === 'tab' ? '\t' : delimiter;
  const rows: string[][] = [];
  let field = '';
  let inQuotes = false;
  let currentRow: string[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped double-quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      }
      field += ch;
      i++;
      continue;
    }

    // Not in quotes
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === sep) {
      currentRow.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r' && text[i + 1] === '\n') {
      currentRow.push(field);
      field = '';
      rows.push(currentRow);
      currentRow = [];
      i += 2;
      continue;
    }

    if (ch === '\n') {
      currentRow.push(field);
      field = '';
      rows.push(currentRow);
      currentRow = [];
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Flush last field/row
  currentRow.push(field);
  if (currentRow.length > 1 || currentRow[0] !== '') {
    rows.push(currentRow);
  }

  return rows;
}

function csvToJson(text: string, delimiter: string, hasHeaders: boolean): object[] {
  const rows = parseCsv(text, delimiter);
  if (rows.length === 0) return [];

  if (hasHeaders) {
    const headers = rows[0];
    const result: object[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const obj: Record<string, string> = {};
      for (let c = 0; c < headers.length; c++) {
        obj[headers[c]] = row[c] ?? '';
      }
      result.push(obj);
    }
    return result;
  } else {
    // No headers: produce arrays
    return rows.map(row => row);
  }
}

export const csvToJsonProcessor: ToolProcessor = {
  inputLabel: 'CSV Input',
  inputPlaceholder: 'Paste CSV data here…',
  autoProcess: true,
  exampleInput: `name,age,city\nAlice,30,New York\nBob,25,"London, UK"\nCharlie,35,Tokyo`,

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
    {
      key: 'headers',
      type: 'checkbox',
      label: 'First row is headers',
      defaultValue: true,
    },
    {
      key: 'indent',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: '0', label: 'Compact' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste CSV to convert.' };
    if (raw.length > MAX_INPUT_BYTES) {
      return { error: `Input too large (${(raw.length / 1_000_000).toFixed(1)} MB). Maximum is 10 MB.` };
    }

    const delimiter = String(input.options?.['delimiter'] ?? ',');
    const hasHeaders = Boolean(input.options?.['headers'] ?? true);
    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);

    let result: object[];
    try {
      result = csvToJson(raw, delimiter, hasHeaders);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'CSV parse failed.' };
    }

    if (result.length === 0) {
      return { error: 'No data rows found in the CSV.' };
    }

    const json = JSON.stringify(result, null, indent === 0 ? undefined : indent);

    return {
      output: {
        value: json,
        type: 'json',
        label: 'JSON Output',
        copyable: true,
        downloadFilename: 'output.json',
        downloadMime: 'application/json',
      },
      meta: {
        rows: result.length,
        'output bytes': json.length,
      },
    };
  },
};
