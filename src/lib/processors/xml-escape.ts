import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const XML_UNESCAPE_MAP: Record<string, string> = {
  '&amp;':  '&',
  '&lt;':   '<',
  '&gt;':   '>',
  '&quot;': '"',
  '&apos;': "'",
};

function xmlEscape(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => XML_ESCAPE_MAP[ch] ?? ch);
}

function xmlUnescape(str: string): string {
  // Replace named entities
  let result = str.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => XML_UNESCAPE_MAP[entity] ?? entity);
  // Replace numeric entities &#NNN; and &#xHHH;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  result = result.replace(/&#(\d+);/g, (_, dec) =>
    String.fromCodePoint(parseInt(dec, 10))
  );
  return result;
}

export const xmlEscapeProcessor: ToolProcessor = {
  inputLabel: 'Input',
  inputPlaceholder: 'Enter text to escape, or XML-escaped text to unescape…',
  autoProcess: true,
  exampleInput: 'Price: <5 & "great" deal',

  optionControls: [
    {
      key: 'mode',
      type: 'select',
      label: 'Mode',
      defaultValue: 'escape',
      options: [
        { value: 'escape',   label: 'Escape → XML safe' },
        { value: 'unescape', label: 'Unescape ← XML entities' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to escape or unescape.' };

    const mode = String(input.options?.['mode'] ?? 'escape');

    if (mode === 'escape') {
      const escaped = xmlEscape(raw);
      return {
        output: {
          value: escaped,
          type: 'text',
          label: 'XML-Escaped Text',
          copyable: true,
          downloadFilename: 'escaped.txt',
          downloadMime: 'text/plain',
        },
        meta: {
          'input length': raw.length,
          'output length': escaped.length,
        },
      };
    }

    const unescaped = xmlUnescape(raw);
    return {
      output: {
        value: unescaped,
        type: 'text',
        label: 'Unescaped Text',
        copyable: true,
        downloadFilename: 'unescaped.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': raw.length,
        'output length': unescaped.length,
      },
    };
  },
};
