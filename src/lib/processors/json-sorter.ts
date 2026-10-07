import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function sortObject(value: unknown, descending: boolean): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => sortObject(v, descending));
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    if (descending) keys.reverse();
    const sorted: Record<string, unknown> = {};
    for (const key of keys) {
      sorted[key] = sortObject(obj[key], descending);
    }
    return sorted;
  }
  return value;
}

export const jsonSorterProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste your JSON here…',
  autoProcess: true,
  exampleInput: '{"z": 3, "a": 1, "m": {"beta": 2, "alpha": 1}, "b": [3,1,2]}',

  optionControls: [
    {
      key: 'order',
      type: 'select',
      label: 'Key order',
      defaultValue: 'asc',
      options: [
        { value: 'asc',  label: 'A → Z (ascending)' },
        { value: 'desc', label: 'Z → A (descending)' },
      ],
    },
    {
      key: 'indent',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to sort.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'JSON parse error';
      return { error: `Invalid JSON:\n\n${msg}` };
    }

    const descending = String(input.options?.['order'] ?? 'asc') === 'desc';
    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);

    const sorted = sortObject(parsed, descending);
    const output = JSON.stringify(sorted, null, indent);

    return {
      output: {
        value: output,
        type: 'json',
        label: 'Sorted JSON',
        copyable: true,
        downloadFilename: 'sorted.json',
        downloadMime: 'application/json',
      },
      meta: {
        'key order': descending ? 'Z → A' : 'A → Z',
        'input bytes': raw.length,
        'output bytes': output.length,
      },
    };
  },
};
