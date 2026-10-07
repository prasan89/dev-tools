import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Option helpers
// ---------------------------------------------------------------------------

function getMaxColWidth(options?: Record<string, unknown>): number | null {
  const v = options?.maxColWidth;
  if (v === 'unlimited') return null;
  const n = Number(v);
  if (!isNaN(n) && n > 0) return n;
  return 30; // default
}

function getStyle(options?: Record<string, unknown>): 'unicode-box' | 'ascii' | 'markdown-table' {
  const v = options?.style;
  if (v === 'ascii' || v === 'markdown-table') return v;
  return 'unicode-box';
}

function getMaxRows(options?: Record<string, unknown>): number | null {
  const v = options?.maxRows;
  if (v === 'all') return null;
  const n = Number(v);
  if (!isNaN(n) && n > 0) return n;
  return 100; // default
}

// ---------------------------------------------------------------------------
// Table rendering
// ---------------------------------------------------------------------------

function truncate(value: string, maxWidth: number | null): { text: string; wasTruncated: boolean } {
  if (maxWidth === null || value.length <= maxWidth) {
    return { text: value, wasTruncated: false };
  }
  return { text: value.slice(0, maxWidth - 1) + '…', wasTruncated: true };
}

function cellValue(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function renderUnicodeBox(
  headers: string[],
  rows: string[][],
  colWidths: number[],
): string {
  const lines: string[] = [];

  // Top border
  const top =
    '┌' + colWidths.map((w) => '─'.repeat(w + 2)).join('┬') + '┐';
  lines.push(top);

  // Header row
  const headerRow =
    '│' + headers.map((h, i) => ' ' + h.padEnd(colWidths[i]) + ' ').join('│') + '│';
  lines.push(headerRow);

  // Header/body separator
  const sep =
    '├' + colWidths.map((w) => '─'.repeat(w + 2)).join('┼') + '┤';
  lines.push(sep);

  // Body rows
  for (const row of rows) {
    const rowLine =
      '│' + row.map((cell, i) => ' ' + cell.padEnd(colWidths[i]) + ' ').join('│') + '│';
    lines.push(rowLine);
  }

  // Bottom border
  const bottom =
    '└' + colWidths.map((w) => '─'.repeat(w + 2)).join('┴') + '┘';
  lines.push(bottom);

  return lines.join('\n');
}

function renderAscii(
  headers: string[],
  rows: string[][],
  colWidths: number[],
): string {
  const lines: string[] = [];

  const divider = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';

  lines.push(divider);

  const headerRow =
    '|' + headers.map((h, i) => ' ' + h.padEnd(colWidths[i]) + ' ').join('|') + '|';
  lines.push(headerRow);

  lines.push(divider);

  for (const row of rows) {
    const rowLine =
      '|' + row.map((cell, i) => ' ' + cell.padEnd(colWidths[i]) + ' ').join('|') + '|';
    lines.push(rowLine);
  }

  lines.push(divider);

  return lines.join('\n');
}

function renderMarkdown(
  headers: string[],
  rows: string[][],
  colWidths: number[],
): string {
  const lines: string[] = [];

  const headerRow =
    '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';
  lines.push(headerRow);

  const sepRow =
    '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |';
  lines.push(sepRow);

  for (const row of rows) {
    const rowLine =
      '| ' + row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |';
    lines.push(rowLine);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonTableViewerProcessor: ToolProcessor = {
  inputLabel: 'JSON Array Input',
  inputPlaceholder: '[{"name":"Alice","age":28,"city":"London"},{"name":"Bob","age":35,"city":"NYC"}]',
  autoProcess: true,

  exampleInput: JSON.stringify(
    [
      { name: 'Alice', age: 28, city: 'London', role: 'Engineer' },
      { name: 'Bob', age: 35, city: 'New York', role: 'Designer' },
      { name: 'Carol', age: 22, city: 'San Francisco', role: 'Product Manager' },
      { name: 'Dave', age: 41, city: 'Berlin', role: 'Engineering Manager' },
    ],
    null,
    2,
  ),

  optionControls: [
    {
      key: 'style',
      type: 'select',
      label: 'Table style',
      defaultValue: 'unicode-box',
      options: [
        { value: 'unicode-box', label: 'Unicode box (┌─┐)' },
        { value: 'ascii', label: 'ASCII (+--+)' },
        { value: 'markdown-table', label: 'Markdown (| col |)' },
      ],
    },
    {
      key: 'maxColWidth',
      type: 'select',
      label: 'Max column width',
      defaultValue: '30',
      options: [
        { value: '20', label: '20 chars' },
        { value: '30', label: '30 chars' },
        { value: '50', label: '50 chars' },
        { value: 'unlimited', label: 'Unlimited' },
      ],
    },
    {
      key: 'maxRows',
      type: 'select',
      label: 'Max rows',
      defaultValue: '100',
      options: [
        { value: '50', label: '50 rows' },
        { value: '100', label: '100 rows' },
        { value: '500', label: '500 rows' },
        { value: 'all', label: 'All rows' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON array of objects to render as a table.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (!Array.isArray(parsed)) {
      return {
        error:
          'Input must be a JSON array of objects. Example: [{"name":"Alice","age":28},{"name":"Bob","age":35}]',
      };
    }

    if (parsed.length === 0) {
      return { error: 'The array is empty — nothing to display.' };
    }

    // Check that elements are objects (not primitives or arrays)
    const nonObjects = parsed.filter(
      (item) => item === null || typeof item !== 'object' || Array.isArray(item),
    );
    if (nonObjects.length > 0) {
      return {
        error:
          'All array elements must be plain objects. Found non-object items (primitives or nested arrays). Example: [{"name":"Alice"},{"name":"Bob"}]',
      };
    }

    const maxColWidth = getMaxColWidth(input.options);
    const style = getStyle(input.options);
    const maxRows = getMaxRows(input.options);

    // Collect all column keys (union of all objects)
    const keySet = new Set<string>();
    for (const item of parsed) {
      for (const k of Object.keys(item as Record<string, unknown>)) {
        keySet.add(k);
      }
    }
    const headers = Array.from(keySet);

    const totalRows = parsed.length;
    const visibleItems = maxRows === null ? parsed : parsed.slice(0, maxRows);
    const truncatedRows = totalRows - visibleItems.length;

    // Build string cell matrix and track truncated cells
    let truncatedCells = 0;
    const stringRows: string[][] = visibleItems.map((item) => {
      const record = item as Record<string, unknown>;
      return headers.map((h) => {
        const raw = cellValue(record[h]);
        const { text, wasTruncated } = truncate(raw, maxColWidth);
        if (wasTruncated) truncatedCells++;
        return text;
      });
    });

    // Truncate header labels too
    const displayHeaders = headers.map((h) => {
      const { text } = truncate(h, maxColWidth);
      return text;
    });

    // Compute column widths
    const colWidths = displayHeaders.map((h, i) => {
      let w = h.length;
      for (const row of stringRows) {
        if (row[i].length > w) w = row[i].length;
      }
      return w;
    });

    let table: string;
    if (style === 'ascii') {
      table = renderAscii(displayHeaders, stringRows, colWidths);
    } else if (style === 'markdown-table') {
      table = renderMarkdown(displayHeaders, stringRows, colWidths);
    } else {
      table = renderUnicodeBox(displayHeaders, stringRows, colWidths);
    }

    const meta: Record<string, string | number> = {
      rows: totalRows,
      columns: headers.length,
    };
    if (truncatedCells > 0) meta['truncated cells'] = truncatedCells;
    if (truncatedRows > 0) meta['rows hidden'] = truncatedRows;

    return {
      output: {
        value: table,
        type: 'text',
        label: `Table (${visibleItems.length} of ${totalRows} rows, ${headers.length} columns)`,
        copyable: true,
        downloadFilename: 'table.txt',
        downloadMime: 'text/plain',
      },
      meta,
    };
  },
};
