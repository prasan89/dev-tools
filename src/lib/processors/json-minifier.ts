import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function byteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return Buffer.byteLength(str, 'utf8');
}

export const jsonMinifierProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{\n  "name": "John",\n  "age": 30\n}',
  autoProcess: true,
  exampleInput: '{\n  "user": {\n    "name": "Alice",\n    "age": 28,\n    "active": true\n  },\n  "scores": [95, 87, 92]\n}',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to minify.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    // Serialize compactly — parse + re-stringify is the only safe approach
    const minified = JSON.stringify(parsed);

    const inputBytes = byteLength(raw);
    const outputBytes = byteLength(minified);
    const savedPct = inputBytes > 0
      ? Math.round((1 - outputBytes / inputBytes) * 100)
      : 0;

    const warnings = inputBytes === outputBytes
      ? [{ message: 'Input was already minified — no whitespace to remove.' }]
      : [];

    return {
      output: {
        value: minified,
        type: 'json',
        label: 'Minified JSON',
        copyable: true,
        downloadFilename: 'minified.json',
        downloadMime: 'application/json',
      },
      warnings,
      meta: {
        original: `${inputBytes} bytes`,
        minified: `${outputBytes} bytes`,
        saved: savedPct > 0 ? `${savedPct}%` : '0%',
      },
    };
  },
};
