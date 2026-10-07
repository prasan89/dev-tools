import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Encodes a URL component — suitable for individual query parameter values,
// path segments, or any text that will be embedded in a URL.
// Uses encodeURIComponent which encodes all chars except: A-Z a-z 0-9 - _ . ! ~ * ' ( )

export const urlEncoderProcessor: ToolProcessor = {
  inputLabel: 'Text to Encode',
  inputPlaceholder: 'Enter text to percent-encode…',
  autoProcess: true,
  exampleInput: 'https://example.com/search?q=Java Spring Boot&lang=en',

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to encode.' };

    const encoded = encodeURIComponent(raw);

    return {
      output: {
        value: encoded,
        type: 'text',
        label: 'URL Encoded',
        copyable: true,
        downloadFilename: 'url-encoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': raw.length,
        'output length': encoded.length,
      },
    };
  },
};
