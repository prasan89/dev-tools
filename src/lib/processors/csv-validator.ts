import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// RFC 4180-compliant CSV parser (same core as csv-formatter)
// ---------------------------------------------------------------------------

function detectDelimiter(text: string): string {
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

interface ValidationError {
  row: number;
  col?: number;
  message: string;
}

function validateCsv(text: string, delimiter: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const n = text.length;
  let i = 0;
  let rowNum = 1;
  let headerCols: number | null = null;

  while (i < n) {
    const row: string[] = [];
    let colNum = 1;
    let rowHasErrors = false;

    while (i < n && text[i] !== '\n' && !(text[i] === '\r' && text[i + 1] === '\n')) {
      if (text[i] === '"') {
        i++;
        let closed = false;
        let field = '';
        while (i < n) {
          if (text[i] === '"') {
            if (text[i + 1] === '"') { field += '"'; i += 2; }
            else { i++; closed = true; break; }
          } else {
            field += text[i++];
          }
        }
        if (!closed) {
          errors.push({ row: rowNum, col: colNum, message: 'Unclosed quoted field' });
          rowHasErrors = true;
        }
        row.push(field);
        // Check no junk after closing quote
        if (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          errors.push({
            row: rowNum,
            col: colNum,
            message: `Unexpected character after closing quote: ${JSON.stringify(text[i])}`,
          });
          rowHasErrors = true;
          while (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') i++;
        }
        if (i < n && text[i] === delimiter) i++;
      } else {
        let field = '';
        while (i < n && text[i] !== delimiter && text[i] !== '\n' && text[i] !== '\r') {
          field += text[i++];
        }
        row.push(field);
        if (i < n && text[i] === delimiter) i++;
      }
      colNum++;
    }

    if (row.length > 0) {
      if (headerCols === null) {
        headerCols = row.length;
      } else if (!rowHasErrors && row.length !== headerCols) {
        errors.push({
          row: rowNum,
          message: `Expected ${headerCols} column${headerCols !== 1 ? 's' : ''} but found ${row.length}`,
        });
      }
      rowNum++;
    }

    if (i < n && text[i] === '\r') i++;
    if (i < n && text[i] === '\n') i++;
  }

  return errors;
}

export const csvValidatorProcessor: ToolProcessor = {
  inputLabel: 'CSV Input',
  inputPlaceholder: 'Paste your CSV here to validate…',
  autoProcess: true,
  exampleInput: `name,age,city
Alice,30,New York
Bob,25,London
Carol,35,San Francisco`,

  optionControls: [
    {
      key: 'delimiter',
      type: 'select',
      label: 'Delimiter',
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
    if (!raw) return { error: 'Paste CSV to validate.' };

    const delimOpt = String(input.options?.['delimiter'] ?? 'auto');
    const delimiter = delimOpt === 'auto' ? detectDelimiter(raw) : delimOpt;

    const errors = validateCsv(raw, delimiter);

    if (errors.length === 0) {
      // Count rows/cols quickly
      const lines = raw.split(/\r?\n/).filter((l) => l.trim());
      const headerCols = lines[0] ? lines[0].split(delimiter).length : 0;
      const summary = `✓ CSV is valid.\n\nRows:      ${lines.length}\nColumns:   ${headerCols}\nDelimiter: ${delimiter === '\t' ? 'tab' : JSON.stringify(delimiter)}`;

      return {
        output: {
          value: summary,
          type: 'text',
          label: 'Validation Result',
          copyable: true,
        },
        meta: {
          valid: 'yes',
          rows: lines.length,
          columns: headerCols,
          delimiter: delimiter === '\t' ? 'tab' : delimiter,
        },
      };
    }

    // Format errors
    const MAX_ERRORS = 20;
    const shown = errors.slice(0, MAX_ERRORS);
    const lines = [
      `✗ Found ${errors.length} error${errors.length !== 1 ? 's' : ''}:\n`,
      ...shown.map((e) =>
        `Row ${e.row}${e.col !== undefined ? `, field ${e.col}` : ''}:\n  ${e.message}`
      ),
      ...(errors.length > MAX_ERRORS ? [`\n…and ${errors.length - MAX_ERRORS} more errors.`] : []),
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'Validation Errors',
        copyable: true,
      },
      meta: {
        valid: 'no',
        errors: errors.length,
        delimiter: delimiter === '\t' ? 'tab' : delimiter,
      },
    };
  },
};
