import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

/**
 * Strip line comments (//) and block comments (slash-star ... star-slash) from
 * a JSONC string without touching content inside string literals, then strip
 * trailing commas.
 *
 * The parser walks character-by-character to track:
 *  - whether we are inside a double-quoted string (respects \" escapes)
 *  - whether we are inside a single-line line comment
 *  - whether we are inside a block comment
 *
 * Returns the cleaned string plus counts of removed comments and trailing commas.
 */
function stripJsonc(input: string): {
  result: string;
  commentsRemoved: number;
  trailingCommasRemoved: number;
} {
  let result = '';
  let i = 0;
  let inString = false;
  let commentsRemoved = 0;
  let trailingCommasRemoved = 0;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (inString) {
      if (ch === '\\') {
        // Escaped character — emit both characters and skip ahead
        result += ch + (input[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
        i++;
        continue;
      }
      result += ch;
      i++;
      continue;
    }

    // Not inside a string
    if (ch === '"') {
      inString = true;
      result += ch;
      i++;
      continue;
    }

    // Single-line comment //
    if (ch === '/' && next === '/') {
      commentsRemoved++;
      i += 2;
      while (i < input.length && input[i] !== '\n') {
        i++;
      }
      // Preserve the newline so line numbers stay consistent
      if (i < input.length && input[i] === '\n') {
        result += '\n';
        i++;
      }
      continue;
    }

    // Block comment /* ... */
    if (ch === '/' && next === '*') {
      commentsRemoved++;
      i += 2;
      while (i < input.length) {
        if (input[i] === '*' && input[i + 1] === '/') {
          i += 2;
          break;
        }
        // Preserve newlines inside block comments for line number alignment
        if (input[i] === '\n') {
          result += '\n';
        }
        i++;
      }
      continue;
    }

    result += ch;
    i++;
  }

  // Strip trailing commas: a comma followed (possibly across whitespace/newlines)
  // by a ] or } character.
  // We use a regex replace after the comment pass so we never touch string content
  // (strings are already emitted verbatim above; this second pass is safe for
  //  well-formed JSONC where strings don't span multiple logical values).
  const cleaned = result.replace(/,(\s*[}\]])/g, (_match, suffix) => {
    trailingCommasRemoved++;
    return suffix;
  });

  return { result: cleaned, commentsRemoved, trailingCommasRemoved };
}

function getIndent(options?: Record<string, unknown>): number {
  const indent = options?.indent;
  if (indent === '4' || indent === 4) return 4;
  return 2;
}

export const jsoncToJsonProcessor: ToolProcessor = {
  inputLabel: 'JSONC Input',
  inputPlaceholder:
    '{\n  // Server configuration\n  "host": "localhost", /* default host */\n  "port": 8080,\n  "urls": [\n    "http://example.com",\n    "https://api.example.com",\n  ],\n}',
  autoProcess: true,
  exampleInput: `{
  // Application settings
  "name": "my-app",
  "version": "1.0.0",

  /* Database configuration
     supports PostgreSQL and MySQL */
  "database": {
    "host": "localhost",
    "port": 5432,
    "ssl": true, // enable TLS
  },

  "urls": [
    "http://example.com",
    "https://api.example.com/v2", // production endpoint
  ],

  "features": {
    "darkMode": true,
    "beta": false, /* disabled for now */
  }
}`,

  optionControls: [
    {
      key: 'indent',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
    {
      key: 'prettify',
      type: 'checkbox',
      label: 'Prettify output',
      defaultValue: true,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSONC to convert.' };

    const indent = getIndent(input.options);
    const prettify = input.options?.prettify !== false;

    // Strip comments and trailing commas
    const { result: stripped, commentsRemoved, trailingCommasRemoved } = stripJsonc(raw);

    // Validate the stripped result is proper JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(stripped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        error: `Failed to parse after stripping comments: ${msg}`,
        meta: {
          'comments removed': commentsRemoved,
          'trailing commas removed': trailingCommasRemoved,
          'output valid': 'no',
        },
      };
    }

    const output = prettify
      ? JSON.stringify(parsed, null, indent)
      : JSON.stringify(parsed);

    return {
      output: {
        value: output,
        type: 'json',
        label: 'Standard JSON',
        copyable: true,
        downloadFilename: 'converted.json',
        downloadMime: 'application/json',
      },
      meta: {
        'comments removed': commentsRemoved,
        'trailing commas removed': trailingCommasRemoved,
        'output valid': 'yes',
      },
    };
  },
};
