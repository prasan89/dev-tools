import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

async function computeHash(text: string, algorithm: Algorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous wrapper using a pre-resolved promise trick.
// We store the async result synchronously via a captured variable.
// This works because the ToolWorkspace calls process() and re-renders
// when the result arrives, but we need the interface to stay sync.
// For hash-generator we set autoProcess: false so users hit "Generate".
// We store the last computed hash result so the UI can display it.

let _lastResult: ToolResult = { error: 'Click Generate to compute the hash.' };
let _lastInput = '';
let _lastAlgo = '';

export const hashGeneratorProcessor: ToolProcessor = {
  inputLabel: 'Input Text',
  inputPlaceholder: 'Enter text to hash…',
  autoProcess: false,
  exampleInput: 'Hello, World!',

  optionControls: [
    {
      key: 'algorithm',
      type: 'select',
      label: 'Algorithm',
      defaultValue: 'SHA-256',
      options: [
        { value: 'SHA-1',   label: 'SHA-1' },
        { value: 'SHA-256', label: 'SHA-256' },
        { value: 'SHA-384', label: 'SHA-384' },
        { value: 'SHA-512', label: 'SHA-512' },
      ],
    },
    {
      key: 'uppercase',
      type: 'checkbox',
      label: 'Uppercase output',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to hash.' };

    const algorithm = (String(input.options?.['algorithm'] ?? 'SHA-256')) as Algorithm;
    const uppercase = Boolean(input.options?.['uppercase']);

    const cacheKey = `${raw}::${algorithm}::${uppercase}`;

    // Return cached result if the input hasn't changed
    if (cacheKey === _lastInput + '::' + _lastAlgo) {
      return _lastResult;
    }

    // Kick off async computation and return a temporary loading state
    _lastInput = raw;
    _lastAlgo = `${algorithm}::${uppercase}`;

    computeHash(raw, algorithm).then((hex) => {
      const output = uppercase ? hex.toUpperCase() : hex;
      _lastResult = {
        output: {
          value: output,
          type: 'text',
          label: `${algorithm} Hash`,
          copyable: true,
          downloadFilename: 'hash.txt',
          downloadMime: 'text/plain',
        },
        meta: {
          algorithm,
          'input length': raw.length,
          'hash length': output.length,
        },
      };
    });

    // Return last known result while async runs
    return _lastResult;
  },
};
