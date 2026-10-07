import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { diffCheckerProcessor, DiffData } from './diff-checker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
interface JsonObject { [key: string]: JsonValue }

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

interface DiffEntry {
  path: string;
  status: DiffStatus;
  leftValue?: JsonValue;
  rightValue?: JsonValue;
}

// ---------------------------------------------------------------------------
// Core diff algorithm
//
// Array comparison is positional: index 0 compared to index 0, etc.
// Added/removed items at the tail are reported as such.
// ---------------------------------------------------------------------------

function diffValues(
  left: JsonValue,
  right: JsonValue,
  path: string,
  results: DiffEntry[]
): void {
  if (isObject(left) && isObject(right)) {
    diffObjects(left, right, path, results);
    return;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    diffArrays(left, right, path, results);
    return;
  }
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    results.push({ path, status: 'changed', leftValue: left, rightValue: right });
  }
}

function diffObjects(
  left: JsonObject,
  right: JsonObject,
  basePath: string,
  results: DiffEntry[]
): void {
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of allKeys) {
    const p = basePath ? `${basePath}.${key}` : key;
    const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
    const hasRight = Object.prototype.hasOwnProperty.call(right, key);

    if (hasLeft && !hasRight) {
      results.push({ path: p, status: 'removed', leftValue: left[key] });
    } else if (!hasLeft && hasRight) {
      results.push({ path: p, status: 'added', rightValue: right[key] });
    } else {
      diffValues(left[key], right[key], p, results);
    }
  }
}

function diffArrays(
  left: JsonValue[],
  right: JsonValue[],
  basePath: string,
  results: DiffEntry[]
): void {
  const maxLen = Math.max(left.length, right.length);
  for (let i = 0; i < maxLen; i++) {
    const p = `${basePath}[${i}]`;
    if (i >= left.length) {
      results.push({ path: p, status: 'added', rightValue: right[i] });
    } else if (i >= right.length) {
      results.push({ path: p, status: 'removed', leftValue: left[i] });
    } else {
      diffValues(left[i], right[i], p, results);
    }
  }
}

function isObject(v: JsonValue): v is JsonObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ---------------------------------------------------------------------------
// Format diff entries as human-readable text
// ---------------------------------------------------------------------------

function formatValue(v: JsonValue | undefined): string {
  if (v === undefined) return '';
  if (typeof v === 'string') return `"${v}"`;
  if (v === null) return 'null';
  if (typeof v === 'object') {
    const s = JSON.stringify(v, null, 2);
    return s.length > 120 ? s.slice(0, 120) + '…' : s;
  }
  return String(v);
}

function formatDiff(results: DiffEntry[]): string {
  if (results.length === 0) return '✓ JSON documents are identical';

  const lines: string[] = [];
  for (const d of results) {
    lines.push('');
    lines.push(d.path);
    if (d.status === 'added') {
      lines.push(`+ ${formatValue(d.rightValue)}`);
    } else if (d.status === 'removed') {
      lines.push(`− ${formatValue(d.leftValue)}`);
    } else if (d.status === 'changed') {
      lines.push(`  ${formatValue(d.leftValue)}  →  ${formatValue(d.rightValue)}`);
    }
  }
  return lines.join('\n').trim();
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonDiffProcessor: ToolProcessor = {
  inputLabel: 'Original JSON',
  inputPlaceholder: '{"name":"John","age":30}',
  hasSecondaryInput: true,
  secondaryInputLabel: 'Changed JSON',
  autoProcess: true,
  layoutVariant: 'diff',
  exampleInput: '{"name":"John","age":30,"city":"Mumbai","tags":["developer","java"]}',
  exampleSecondary: '{"name":"John","age":31,"city":"Chennai","tags":["developer","spring"],"active":true}',

  process(input: ToolInput): ToolResult {
    const leftRaw = input.value.trim();
    const rightRaw = (input.secondary ?? '').trim();

    if (!leftRaw && !rightRaw) return { error: 'Paste JSON into both panels to compare.' };
    if (!leftRaw) return { error: 'Original JSON is empty.' };
    if (!rightRaw) return { error: 'Changed JSON is empty.' };

    let left: JsonValue;
    let right: JsonValue;

    try {
      left = JSON.parse(leftRaw) as JsonValue;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Original JSON is invalid: ${msg}` };
    }

    try {
      right = JSON.parse(rightRaw) as JsonValue;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Changed JSON is invalid: ${msg}` };
    }

    // Produce line-based diff using formatted JSON strings
    const leftFormatted = JSON.stringify(left, null, 2);
    const rightFormatted = JSON.stringify(right, null, 2);

    // Delegate to diff-checker for the line diff
    const lineDiffResult = diffCheckerProcessor.process({
      value: leftFormatted,
      secondary: rightFormatted,
      options: {},
    });

    if (lineDiffResult.error) return lineDiffResult;

    const diffData = JSON.parse(lineDiffResult.output!.value) as DiffData;

    // Also compute structural diff for metadata
    const structuralResults: DiffEntry[] = [];
    diffValues(left, right, '', structuralResults);
    const added = structuralResults.filter((r) => r.status === 'added').length;
    const removed = structuralResults.filter((r) => r.status === 'removed').length;
    const changed = structuralResults.filter((r) => r.status === 'changed').length;

    return {
      output: {
        value: JSON.stringify(diffData),
        type: 'json',
        label: 'JSON Diff',
        copyable: true,
        downloadFilename: 'json-diff.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        added,
        removed,
        changed,
        total: structuralResults.length,
      },
    };
  },
};
