import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

type Language = 'javascript' | 'python' | 'go' | 'java';

function escapeJsonString(str: string, escapeUnicode: boolean): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (ch === '\\') {
      result += '\\\\';
    } else if (ch === '"') {
      result += '\\"';
    } else if (ch === '\n') {
      result += '\\n';
    } else if (ch === '\r') {
      result += '\\r';
    } else if (ch === '\t') {
      result += '\\t';
    } else if (code < 0x20) {
      result += '\\u' + code.toString(16).padStart(4, '0');
    } else if (escapeUnicode && code > 0x7e) {
      result += '\\u' + code.toString(16).padStart(4, '0');
    } else {
      result += ch;
    }
  }
  return result;
}

function wrapForLanguage(escaped: string, language: Language): string {
  switch (language) {
    case 'javascript':
      return `const data = JSON.parse('${escaped.replace(/'/g, "\\'")}');`;
    case 'python':
      return `import json\ndata = json.loads("${escaped}")`;
    case 'go':
      // Go raw string literals use backticks; use a regular string if backtick present
      if (escaped.includes('`')) {
        return `data := []byte("${escaped}")`;
      }
      return `data := []byte(\`${escaped}\`)`;
    case 'java':
      return `String json = "${escaped}";`;
    default:
      return escaped;
  }
}

export const jsonStringifyProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"name":"Alice","age":30,"active":true}',
  autoProcess: true,
  exampleInput: '{"name":"Alice","age":30,"active":true}',

  optionControls: [
    {
      key: 'minify',
      type: 'checkbox',
      label: 'Minify before stringifying',
      defaultValue: true,
    },
    {
      key: 'language',
      type: 'select',
      label: 'Target language',
      defaultValue: 'javascript',
      options: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
        { value: 'java', label: 'Java' },
      ],
    },
    {
      key: 'escapeUnicode',
      type: 'checkbox',
      label: 'Escape non-ASCII as \\uXXXX',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to stringify.' };

    const minify = input.options?.minify !== false;
    const language = (input.options?.language as Language | undefined) ?? 'javascript';
    const escapeUnicode = input.options?.escapeUnicode === true;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const jsonStr = minify
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, 2);

    const escaped = escapeJsonString(jsonStr, escapeUnicode);
    const output = wrapForLanguage(escaped, language);

    const languageLabels: Record<Language, string> = {
      javascript: 'JavaScript',
      python: 'Python',
      go: 'Go',
      java: 'Java',
    };

    return {
      output: {
        value: output,
        type: 'text',
        label: `JSON String Literal (${languageLabels[language]})`,
        copyable: true,
        downloadFilename: 'stringified.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'json length': jsonStr.length,
        'output length': output.length,
        minified: minify ? 'yes' : 'no',
        language: languageLabels[language],
      },
    };
  },
};
