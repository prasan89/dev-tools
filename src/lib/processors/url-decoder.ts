import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

export const urlDecoderProcessor: ToolProcessor = {
  inputLabel: 'URL Encoded Text',
  inputPlaceholder: 'Paste percent-encoded text here…',
  autoProcess: true,
  exampleInput: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3DJava%20Spring%20Boot%26lang%3Den',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste URL-encoded text to decode.' };

    let decoded: string;
    try {
      decoded = decodeURIComponent(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid percent-encoded sequence: ${msg}` };
    }

    return {
      output: {
        value: decoded,
        type: 'text',
        label: 'Decoded Text',
        copyable: true,
        downloadFilename: 'url-decoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': raw.length,
        'output length': decoded.length,
      },
    };
  },
};
