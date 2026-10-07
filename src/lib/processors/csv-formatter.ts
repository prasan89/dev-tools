import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// RFC 4180-compliant CSV parser
// ---------------------------------------------------------------------------

interface ParsedCsv {
  rows: string[][];
  delimiter: string;
}

interface ParseError {
  row: number;
  col?: number;
  message: string;
}

function detectDelimiter(text: string): string {
  // Count occurrences outside quotes for the first 2048 chars
  const sample = text.slice(0, 2048);
  const counts: Record<string, number> = { ',': 0, '\t': 0, ';': 0, '|': 0 };
  let inQuote = false;
  for (const ch of sample) {
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (!inQuote && ch in counts) counts[ch]++;
  }
  let best = ',';
  let bestCount = counts[','];
  for (const [del, cnt] of Object.entries(counts)) {
    if (cnt > bestCount) { best = del; bestCount = cnt; }
  }
  return best;
}

function parseCsv(text: string, delimiter: string): { rows: string[][]; errors: ParseError[] } {
  const rows: string[][] = [];
  const errors: ParseError[] = [];
  const n = text.length;
  let i = 0;
  let rowNum = 1;

  while (i < n) {
    const row: string[] = [];
    let colNum = 1;

    // Parse one row
    while (i < n && text[i] !== '\n' && !(text[i] === '\r' && text[i + 1] === '\n')) {
      // Quoted field
      if (text[i] === '"') {
        i++; // skip opening quote
        let field = '';
        let closed = false;
        while (i < n) {
          if (text[i] === '"') {
            if (text[i + 1] === '"') {
              field += '"'; i += 2; // escaped quote
            } else {
              i++; closed = true; break; // closing quote
            }
          } else {
            field += text[i++];
          }
        }
        if (!closed) {
          errors.push({ row: rowNum, col: colNum, message: 'Unclosed quoted field' });
        }
        row.push(field);
        // After closing quote, expect delimiter or end of line
        if (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          errors.push({ row: rowNum, col: colNum, message: `Unexpected character after closing quote: ${JSON.stringify(text[i])}` });
          // Skip until delimiter or EOL
          while (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') i++;
        }
        if (i < n && text[i] === delimiter) i++;
      } else {
        // Unquoted field — read until delimiter or EOL
        let field = '';
        while (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++];
        }
        row.push(field);
        if (i < n && text[i] === delimiter) i++;
      }
      colNum++;
    }

    if (row.length > 0 || (i < n && text[i] !== '\n' && text[i] !== '\r')) {
      rows.push(row);
      rowNum++;
    }

    // Skip line ending
    if (i < n && text[i] === '\r') i++;
    if (i < n && text[i] === '\n') i++;
  }

  return { rows, errors };
}

// ---------------------------------------------------------------------------
// CSV serializer — always uses double-quoting when a field needs it
// ---------------------------------------------------------------------------
function serializeField(field: string, delimiter: string): string {
  if (
    field.includes('"') ||
    field.includes(delimiter) ||
    field.includes('\n') ||
    field.includes('\r')
  ) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function serializeCsv(rows: string[][], delimiter: string): string {
  return rows
    .map((row) => row.map((f) => serializeField(f, delimiter)).join(delimiter))
    .join('\n');
}

// ---------------------------------------------------------------------------
// CSV Formatter processor
// ---------------------------------------------------------------------------
export const csvFormatterProcessor: ToolProcessor = {
  inputLabel: 'CSV Input',
  inputPlaceholder: 'Paste your CSV here…',
  autoProcess: true,
  exampleInput: `name,age,city
"Alice Smith",30,"New York"
Bob,25,London
"Carol, Jr.",35,"San Francisco"`,

  optionControls: [
    {
      key: 'delimiter',
      type: 'select',
      label: 'Output delimiter',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: 'Auto-detect' },
        { value: ',',    label: 'Comma (,)' },
        { value: '\t',   label: 'Tab (TSV)' },
        { value: ';',    label: 'Semicolon (;)' },
        { value: '|',    label: 'Pipe (|)' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste CSV to format.' };

    const delimOpt = String(input.options?.['delimiter'] ?? 'auto');
    const delimiter = delimOpt === 'auto' ? detectDelimiter(raw) : delimOpt;

    const { rows, errors } = parseCsv(raw, delimiter);

    if (errors.length > 0) {
      const msgs = errors.slice(0, 3).map((e) =>
        `Row ${e.row}${e.col !== undefined ? `, field ${e.col}` : ''}: ${e.message}`
      );
      return {
        error: `CSV has parse errors:\n\n${msgs.join('\n')}${errors.length > 3 ? `\n…and ${errors.length - 3} more` : ''}`,
      };
    }

    if (rows.length === 0) return { error: 'No rows found in input.' };

    const formatted = serializeCsv(rows, delimiter);
    const colCount = rows[0].length;
    const inconsistent = rows.filter((r) => r.length !== colCount).length;

    return {
      output: {
        value: formatted,
        type: 'text',
        label: 'Formatted CSV',
        copyable: true,
        downloadFilename: 'formatted.csv',
        downloadMime: 'text/csv',
      },
      meta: {
        rows: rows.length,
        columns: colCount,
        delimiter: delimiter === '\t' ? 'tab' : delimiter,
        ...(inconsistent > 0 ? { warning: `${inconsistent} rows have different column counts` } : {}),
      },
      ...(inconsistent > 0 ? {
        warnings: [{ message: `${inconsistent} row(s) have an inconsistent number of columns.` }]
      } : {}),
    };
  },
};
