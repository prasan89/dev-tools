import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Encode the five characters that have special meaning in HTML.
// Using a Map rather than a regex chain keeps the order deterministic
// and avoids double-encoding & → &amp;amp;
const HTML_ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function encodeHTML(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ENCODE_MAP[ch] ?? ch);
}

export const htmlEncoderProcessor: ToolProcessor = {
  inputLabel: 'HTML to Encode',
  inputPlaceholder: 'Enter HTML or text containing special characters…',
  autoProcess: true,
  exampleInput: '<div class="developer">Hello & welcome to <DevToolsHub>!</div>',

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to encode.' };

    const encoded = encodeHTML(raw);
    const changed = encoded !== raw;

    return {
      output: {
        value: encoded,
        type: 'text',
        label: 'HTML Encoded',
        copyable: true,
        downloadFilename: 'html-encoded.txt',
        downloadMime: 'text/plain',
      },
      warnings: !changed
        ? [{ message: 'No HTML special characters found — output is identical to input.' }]
        : [],
      meta: {
        'input length': raw.length,
        'output length': encoded.length,
      },
    };
  },
};
