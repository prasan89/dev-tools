import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Proper UTF-8 → Base64 that handles all Unicode including emoji.
// btoa() only handles Latin-1; we need to encode UTF-8 bytes first.
function encodeBase64(text: string): string {
  // Node.js / Next.js SSR / Jest (jsdom) — Buffer is always available here
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf8').toString('base64');
  }
  // Pure browser fallback (no Buffer polyfill): TextEncoder → Uint8Array → btoa
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const base64EncoderProcessor: ToolProcessor = {
  inputLabel: 'Text to Encode',
  inputPlaceholder: 'Enter text to encode…',
  autoProcess: true,
  exampleInput: 'Hello DevToolsHub 🚀',

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to encode.' };

    const encoded = encodeBase64(raw);

    return {
      output: {
        value: encoded,
        type: 'text',
        label: 'Base64 Encoded',
        copyable: true,
        downloadFilename: 'encoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': raw.length,
        'output length': encoded.length,
      },
    };
  },
};
