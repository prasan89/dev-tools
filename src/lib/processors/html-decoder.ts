import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Named entity map — covers the five standard HTML entities plus common extras.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
};

function decodeHTML(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));/g, (match, dec, hex, name) => {
    if (dec) {
      const cp = parseInt(dec, 10);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    }
    if (hex) {
      const cp = parseInt(hex, 16);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    }
    if (name) {
      return NAMED_ENTITIES[name] ?? match;
    }
    return match;
  });
}

export const htmlDecoderProcessor: ToolProcessor = {
  inputLabel: 'HTML Entities to Decode',
  inputPlaceholder: 'Paste HTML-encoded text here…',
  autoProcess: true,
  exampleInput: '&lt;div class=&quot;developer&quot;&gt;Hello &amp; welcome to &lt;DevToolsHub&gt;!&lt;/div&gt;',

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Paste HTML-encoded text to decode.' };

    const decoded = decodeHTML(raw);

    return {
      output: {
        value: decoded,
        type: 'text',
        label: 'Decoded Text',
        copyable: true,
        downloadFilename: 'html-decoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input length': raw.length,
        'output length': decoded.length,
      },
    };
  },
};
