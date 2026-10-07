import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// RFC 4122: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
// M = version nibble (1–5, a, b, c allowed by future specs)
// N = variant bits: 8..b for RFC 4122
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-([89ab][0-9a-f]{3})-[0-9a-f]{12}$/i;

const VERSION_LABELS: Record<string, string> = {
  '1': 'v1 (time-based)',
  '2': 'v2 (DCE security)',
  '3': 'v3 (name-based, MD5)',
  '4': 'v4 (random)',
  '5': 'v5 (name-based, SHA-1)',
};

export const uuidValidatorProcessor: ToolProcessor = {
  inputLabel: 'UUID',
  inputPlaceholder: 'Enter a UUID to validate…',
  autoProcess: true,
  exampleInput: '550e8400-e29b-41d4-a716-446655440000',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a UUID to validate.' };

    const match = raw.match(UUID_REGEX);
    if (!match) {
      // Give a specific error
      const parts = raw.split('-');
      if (parts.length !== 5) {
        return { error: `Invalid UUID: expected 5 hyphen-separated groups, got ${parts.length}.` };
      }
      const lengths = parts.map((p) => p.length);
      const expected = [8, 4, 4, 4, 12];
      for (let i = 0; i < 5; i++) {
        if (lengths[i] !== expected[i]) {
          return { error: `Invalid UUID: group ${i + 1} should be ${expected[i]} hex chars, got ${lengths[i]}.` };
        }
      }
      if (!/^[0-9a-f-]+$/i.test(raw)) {
        return { error: 'Invalid UUID: contains non-hexadecimal characters.' };
      }
      return { error: 'Invalid UUID format.' };
    }

    const versionNibble = match[1].toLowerCase();
    const versionLabel = VERSION_LABELS[versionNibble] ?? `v${versionNibble} (unknown)`;
    const normalised = raw.toLowerCase();

    return {
      output: {
        value: `Valid UUID\nVersion: ${versionLabel}\nNormalised: ${normalised}`,
        type: 'text',
        label: 'Validation Result',
        copyable: true,
      },
      meta: {
        version: versionLabel,
      },
    };
  },
};
