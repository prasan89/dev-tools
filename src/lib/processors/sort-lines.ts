import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function numericCompare(a: string, b: string): number {
  const na = parseFloat(a.trim());
  const nb = parseFloat(b.trim());
  const aIsNum = !isNaN(na);
  const bIsNum = !isNaN(nb);
  if (aIsNum && bIsNum) return na - nb;
  if (aIsNum) return -1; // numbers before non-numbers
  if (bIsNum) return 1;
  return a.localeCompare(b);
}

export const sortLinesProcessor: ToolProcessor = {
  inputLabel: 'Input Text',
  inputPlaceholder: 'Paste lines to sort…',
  autoProcess: true,
  exampleInput: `banana
apple
cherry
date
elderberry
apple`,

  optionControls: [
    {
      key: 'order',
      type: 'select',
      label: 'Order',
      defaultValue: 'asc',
      options: [
        { value: 'asc',  label: 'A → Z (ascending)' },
        { value: 'desc', label: 'Z → A (descending)' },
      ],
    },
    {
      key: 'mode',
      type: 'select',
      label: 'Sort mode',
      defaultValue: 'alpha',
      options: [
        { value: 'alpha',   label: 'Alphabetical' },
        { value: 'numeric', label: 'Numeric' },
        { value: 'length',  label: 'By length' },
      ],
    },
    {
      key: 'caseInsensitive',
      type: 'checkbox',
      label: 'Case-insensitive',
      defaultValue: false,
    },
    {
      key: 'removeDuplicates',
      type: 'checkbox',
      label: 'Remove duplicate lines',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw.trim()) return { error: 'Paste text to sort.' };

    const order = String(input.options?.['order'] ?? 'asc');
    const mode  = String(input.options?.['mode']  ?? 'alpha');
    const caseInsensitive = Boolean(input.options?.['caseInsensitive']);
    const removeDuplicates = Boolean(input.options?.['removeDuplicates']);

    let lines = raw.split('\n');
    const originalCount = lines.length;

    // Optionally deduplicate first
    if (removeDuplicates) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const key = caseInsensitive ? l.toLowerCase() : l;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    lines.sort((a, b) => {
      let cmp = 0;
      if (mode === 'numeric') {
        cmp = numericCompare(a, b);
      } else if (mode === 'length') {
        cmp = a.length - b.length || a.localeCompare(b);
      } else {
        const ka = caseInsensitive ? a.toLowerCase() : a;
        const kb = caseInsensitive ? b.toLowerCase() : b;
        cmp = ka.localeCompare(kb);
      }
      return order === 'desc' ? -cmp : cmp;
    });

    const output = lines.join('\n');
    const removed = originalCount - lines.length;

    return {
      output: {
        value: output,
        type: 'text',
        label: 'Sorted Lines',
        copyable: true,
        downloadFilename: 'sorted.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'original lines': originalCount,
        'sorted lines': lines.length,
        'order': order === 'asc' ? 'ascending' : 'descending',
        'mode': mode,
        ...(removed > 0 ? { 'duplicates removed': removed } : {}),
      },
    };
  },
};
