import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function serializeCell(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'undefined') return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeMarkdownCell(value: string): string {
  // Escape pipe characters inside table cells
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function toMarkdownTable(data: unknown[]): string {
  if (data.length === 0) return '_Empty array_';

  const firstItem = data[0];

  // Array of objects -> table with headers from first object's keys
  if (firstItem !== null && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
    const headers = Object.keys(firstItem as Record<string, unknown>);
    const headerRow = '| ' + headers.join(' | ') + ' |';
    const separatorRow = '| ' + headers.map(() => '---').join(' | ') + ' |';
    const rows = data.map((item) => {
      const obj = item as Record<string, unknown>;
      const cells = headers.map((h) => escapeMarkdownCell(serializeCell(obj[h])));
      return '| ' + cells.join(' | ') + ' |';
    });
    return [headerRow, separatorRow, ...rows].join('\n');
  }

  // Array of primitives -> single-column table
  const headerRow = '| Value |';
  const separatorRow = '| --- |';
  const rows = data.map((item) => '| ' + escapeMarkdownCell(serializeCell(item)) + ' |');
  return [headerRow, separatorRow, ...rows].join('\n');
}

function singleObjectToTable(obj: Record<string, unknown>): string {
  const headerRow = '| Key | Value |';
  const separatorRow = '| --- | --- |';
  const rows = Object.entries(obj).map(
    ([k, v]) => `| ${escapeMarkdownCell(k)} | ${escapeMarkdownCell(serializeCell(v))} |`,
  );
  return [headerRow, separatorRow, ...rows].join('\n');
}

function toDefinitionList(parsed: unknown): string {
  if (Array.isArray(parsed)) {
    return parsed
      .map((item, i) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          const obj = item as Record<string, unknown>;
          return (
            `**Item ${i + 1}**\n` +
            Object.entries(obj)
              .map(([k, v]) => `**${k}**: ${serializeCell(v)}`)
              .join('\n')
          );
        }
        return `**${i + 1}**: ${serializeCell(item)}`;
      })
      .join('\n\n');
  }
  if (parsed !== null && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    return Object.entries(obj)
      .map(([k, v]) => `**${k}**: ${serializeCell(v)}`)
      .join('\n');
  }
  return serializeCell(parsed);
}

function toCodeBlock(raw: string, indent: number): string {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, indent);
  } catch {
    formatted = raw;
  }
  return '```json\n' + formatted + '\n```';
}

const EXAMPLE_INPUT = JSON.stringify(
  [
    { name: 'Alice', age: 28, city: 'New York' },
    { name: 'Bob', age: 34, city: 'London' },
    { name: 'Carol', age: 22, city: 'Tokyo' },
  ],
  null,
  2,
);

export const jsonToMarkdownProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '[{"name":"Alice","age":28,"city":"New York"},...]',
  autoProcess: true,
  exampleInput: EXAMPLE_INPUT,

  optionControls: [
    {
      key: 'format',
      type: 'select',
      label: 'Output Format',
      defaultValue: 'table',
      options: [
        { value: 'table', label: 'Markdown Table' },
        { value: 'definition-list', label: 'Definition List' },
        { value: 'code-block', label: 'Code Block' },
      ],
    },
    {
      key: 'indent',
      type: 'select',
      label: 'Indent (code-block mode)',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to convert.' };

    const format = (input.options?.format as string) ?? 'table';
    const indentRaw = input.options?.indent;
    const indent = indentRaw === '4' || indentRaw === 4 ? 4 : 2;

    if (format === 'code-block') {
      const result = toCodeBlock(raw, indent);
      return {
        output: {
          value: result,
          type: 'text',
          label: 'Markdown Code Block',
          copyable: true,
          downloadFilename: 'output.md',
          downloadMime: 'text/markdown',
        },
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (format === 'definition-list') {
      const result = toDefinitionList(parsed);
      return {
        output: {
          value: result,
          type: 'text',
          label: 'Markdown Definition List',
          copyable: true,
          downloadFilename: 'output.md',
          downloadMime: 'text/markdown',
        },
      };
    }

    // Default: table
    let tableMarkdown: string;
    if (Array.isArray(parsed)) {
      tableMarkdown = toMarkdownTable(parsed);
    } else if (parsed !== null && typeof parsed === 'object') {
      tableMarkdown = singleObjectToTable(parsed as Record<string, unknown>);
    } else {
      // Scalar
      tableMarkdown = `| Value |\n| --- |\n| ${escapeMarkdownCell(serializeCell(parsed))} |`;
    }

    return {
      output: {
        value: tableMarkdown,
        type: 'text',
        label: 'Markdown Table',
        copyable: true,
        downloadFilename: 'output.md',
        downloadMime: 'text/markdown',
      },
    };
  },
};
