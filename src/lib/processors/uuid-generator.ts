import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// crypto.randomUUID() is preferred; fallback uses getRandomValues() for RFC 4122 v4
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual v4 via getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Set version bits: version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant bits: RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

export const uuidGeneratorProcessor: ToolProcessor = {
  inputLabel: 'Count',
  inputPlaceholder: 'Number of UUIDs to generate (1–100)',
  autoProcess: false,
  exampleInput: '5',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    const count = raw === '' ? 1 : parseInt(raw, 10);

    if (isNaN(count) || count < 1 || count > 100) {
      return { error: 'Enter a number between 1 and 100.' };
    }

    const uppercase = Boolean(input.options?.['uppercase']);
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      const u = generateUUID();
      uuids.push(uppercase ? u.toUpperCase() : u);
    }

    return {
      output: {
        value: uuids.join('\n'),
        type: 'text',
        label: count === 1 ? 'Generated UUID' : `Generated UUIDs (${count})`,
        copyable: true,
        downloadFilename: 'uuids.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        count: count,
        case: uppercase ? 'uppercase' : 'lowercase',
      },
    };
  },
};
