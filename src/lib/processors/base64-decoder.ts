import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Base64 → UTF-8 text that handles all Unicode.
function decodeBase64(encoded: string): string {
  // Node.js / Next.js SSR / Jest (jsdom) — Buffer is always available here
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(encoded, 'base64').toString('utf8');
  }
  // Pure browser fallback: atob → binary string → Uint8Array → TextDecoder
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function isValidBase64(s: string): boolean {
  // Strip whitespace before validating
  const stripped = s.replace(/\s/g, '');
  return /^[A-Za-z0-9+/]*={0,2}$/.test(stripped) && stripped.length % 4 === 0;
}

export const base64DecoderProcessor: ToolProcessor = {
  inputLabel: 'Base64 Input',
  inputPlaceholder: 'Paste Base64 encoded text here…',
  autoProcess: true,
  exampleInput: 'SGVsbG8gRGV2VG9vbHNIdWIg8J+agA==',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste Base64 text to decode.' };

    // Normalize whitespace (line breaks in Base64 are common)
    const normalized = raw.replace(/\s/g, '');

    if (!isValidBase64(normalized)) {
      return { error: 'Invalid Base64 input. Make sure the text is properly Base64 encoded.' };
    }

    let decoded: string;
    try {
      decoded = decodeBase64(normalized);
    } catch {
      return { error: 'Failed to decode Base64. The input may be malformed.' };
    }

    return {
      output: {
        value: decoded,
        type: 'text',
        label: 'Decoded Text',
        copyable: true,
        downloadFilename: 'decoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': normalized.length,
        'output length': decoded.length,
      },
    };
  },
};
