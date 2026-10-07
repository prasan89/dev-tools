import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

export const removeDuplicateLinesProcessor: ToolProcessor = {
  inputLabel: 'Input Text',
  inputPlaceholder: 'Paste text with duplicate lines…',
  autoProcess: true,
  exampleInput: `apple
banana
apple
orange
banana
grape
APPLE`,

  optionControls: [
    {
      key: 'caseInsensitive',
      type: 'checkbox',
      label: 'Case-insensitive comparison',
      defaultValue: false,
    },
    {
      key: 'trimLines',
      type: 'checkbox',
      label: 'Ignore leading/trailing whitespace',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw.trim()) return { error: 'Paste text to deduplicate.' };

    const caseInsensitive = Boolean(input.options?.['caseInsensitive']);
    const trimLines = Boolean(input.options?.['trimLines']);

    const lines = raw.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];
    let duplicatesRemoved = 0;

    for (const line of lines) {
      const key = (trimLines ? line.trim() : line);
      const normalised = caseInsensitive ? key.toLowerCase() : key;
      if (seen.has(normalised)) {
        duplicatesRemoved++;
      } else {
        seen.add(normalised);
        result.push(line);
      }
    }

    const output = result.join('\n');

    return {
      output: {
        value: output,
        type: 'text',
        label: `Deduplicated (${duplicatesRemoved} duplicate${duplicatesRemoved !== 1 ? 's' : ''} removed)`,
        copyable: true,
        downloadFilename: 'deduplicated.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'original lines': lines.length,
        'unique lines': result.length,
        'removed': duplicatesRemoved,
        'case-insensitive': caseInsensitive ? 'yes' : 'no',
      },
    };
  },
};
