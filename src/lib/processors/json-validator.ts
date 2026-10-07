import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function byteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return Buffer.byteLength(str, 'utf8');
}

interface ParseError {
  message: string;
  line?: number;
  column?: number;
  context?: string;
}

function getDetailedError(raw: string, err: unknown): ParseError {
  const baseMsg = err instanceof Error ? err.message : String(err);

  // V8's JSON.parse errors include position info like "at position N" or "JSON input at line N column N"
  // Extract line/column from the error message if present
  const v8LineCol = baseMsg.match(/at line (\d+) column (\d+)/);
  if (v8LineCol) {
    const line = parseInt(v8LineCol[1], 10);
    const col = parseInt(v8LineCol[2], 10);
    const lines = raw.split('\n');
    const context = lines[line - 1]?.trim();
    return {
      message: baseMsg.replace(/at line \d+ column \d+.*$/, '').trim(),
      line,
      column: col,
      context,
    };
  }

  // Older V8 / SpiderMonkey: "at position N"
  const posMatch = baseMsg.match(/at position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const before = raw.slice(0, pos);
    const line = (before.match(/\n/g) ?? []).length + 1;
    const col = pos - before.lastIndexOf('\n');
    const lines = raw.split('\n');
    const context = lines[line - 1]?.trim();
    return {
      message: baseMsg.replace(/at position \d+.*$/, '').trim(),
      line,
      column: col,
      context,
    };
  }

  return { message: baseMsg };
}

export const jsonValidatorProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"name":"John","age":30}',
  autoProcess: true,
  exampleInput: '{"name":"Alice","age":28,"active":true,"address":{"city":"Chennai","zip":"600001"}}',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to validate.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const detail = getDetailedError(raw, err);
      const parts: string[] = [detail.message];
      if (detail.line !== undefined) {
        parts.push(`Line ${detail.line}, Column ${detail.column}`);
      }
      if (detail.context) {
        parts.push(`Near: ${detail.context}`);
      }
      return { error: parts.join('\n') };
    }

    const type = Array.isArray(parsed) ? 'array' : parsed === null ? 'null' : typeof parsed;
    const keyCount = typeof parsed === 'object' && parsed !== null
      ? Object.keys(parsed as object).length
      : 0;

    return {
      output: {
        value: '✓ Valid JSON',
        type: 'text',
        label: 'Validation Result',
        copyable: false,
      },
      meta: {
        type,
        ...(type === 'object' || type === 'array' ? { 'top-level keys': keyCount } : {}),
        bytes: byteLength(raw),
      },
    };
  },
};
