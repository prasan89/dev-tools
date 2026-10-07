import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function byteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return Buffer.byteLength(str, 'utf8');
}

function getIndent(options?: Record<string, unknown>): number {
  const indent = options?.indent;
  if (indent === 4) return 4;
  return 2;
}

export const jsonFormatterProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"name":"John","age":30,"skills":["Java","Spring Boot"]}',
  autoProcess: true,
  exampleInput: '{"user":{"name":"Alice","age":28,"roles":["admin","editor"]},"settings":{"theme":"dark","notifications":true},"scores":[95,87,92]}',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to format.' };

    const indent = getIndent(input.options);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const formatted = JSON.stringify(parsed, null, indent);

    const inputBytes = byteLength(raw);
    const outputBytes = byteLength(formatted);

    return {
      output: {
        value: formatted,
        type: 'json',
        label: `Formatted JSON (${indent}-space indent)`,
        copyable: true,
        downloadFilename: 'formatted.json',
        downloadMime: 'application/json',
      },
      meta: {
        'input bytes': inputBytes,
        'output bytes': outputBytes,
        keys: countKeys(parsed),
      },
    };
  },
};

function countKeys(val: unknown): number {
  if (val === null || typeof val !== 'object') return 0;
  if (Array.isArray(val)) return val.reduce((s, v) => s + countKeys(v), 0);
  const obj = val as Record<string, unknown>;
  return Object.keys(obj).length + Object.values(obj).reduce((s: number, v) => s + countKeys(v), 0);
}
