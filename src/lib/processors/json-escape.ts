import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function jsonEscape(raw: string): string {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const code = raw.charCodeAt(i);
    switch (ch) {
      case '"':  out += '\\"';  break;
      case '\\': out += '\\\\'; break;
      case '\n': out += '\\n';  break;
      case '\r': out += '\\r';  break;
      case '\t': out += '\\t';  break;
      case '\b': out += '\\b';  break;
      case '\f': out += '\\f';  break;
      default:
        if (code < 0x20) {
          out += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          out += ch;
        }
    }
  }
  return out;
}

function jsonUnescape(escaped: string): string {
  // Wrap in quotes and try JSON.parse — most reliable approach
  try {
    return JSON.parse('"' + escaped + '"');
  } catch {
    throw new Error('Invalid JSON escape sequence. Ensure the input is a valid JSON string body (without surrounding quotes).');
  }
}

export const jsonEscapeProcessor: ToolProcessor = {
  inputLabel: 'Input',
  inputPlaceholder: 'Enter text to escape or a JSON string body to unescape…',
  autoProcess: true,
  exampleInput: 'Hello "World"\nThis is a tab:\there.',

  optionControls: [
    {
      key: 'mode',
      type: 'select',
      label: 'Mode',
      defaultValue: 'escape',
      options: [
        { value: 'escape',   label: 'Escape → JSON string' },
        { value: 'unescape', label: 'Unescape ← JSON string' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw) return { error: 'Enter text to escape or unescape.' };

    const mode = String(input.options?.['mode'] ?? 'escape');

    if (mode === 'escape') {
      const escaped = jsonEscape(raw);
      return {
        output: {
          value: escaped,
          type: 'text',
          label: 'Escaped JSON String',
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

    // unescape
    let unescaped: string;
    try {
      unescaped = jsonUnescape(raw);
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unescape error' };
    }

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
