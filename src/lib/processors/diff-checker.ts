import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiffWord {
  text: string;
  changed: boolean;
}

export interface DiffLine {
  type: 'removed' | 'added' | 'unchanged';
  lineNumLeft: number | null;
  lineNumRight: number | null;
  content: string;
  words?: DiffWord[];
}

export interface DiffData {
  lines: DiffLine[];
  stats: { removed: number; added: number; unchanged: number };
}

// ---------------------------------------------------------------------------
// LCS line diff
// ---------------------------------------------------------------------------

type LineOp = 'equal' | 'insert' | 'delete';
interface RawLine { op: LineOp; line: string }

function computeLcs(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function lineDiff(a: string[], b: string[]): RawLine[] {
  const dp = computeLcs(a, b);
  const result: RawLine[] = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ op: 'equal', line: a[i] }); i++; j++;
    } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ op: 'insert', line: b[j] }); j++;
    } else {
      result.push({ op: 'delete', line: a[i] }); i++;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Word-level diff (LCS on tokens)
// ---------------------------------------------------------------------------

function tokenize(line: string): string[] {
  return line.split(/(\s+|[^a-zA-Z0-9_]+)/).filter(Boolean);
}

function wordDiff(a: string, b: string): { left: DiffWord[]; right: DiffWord[] } {
  const ta = tokenize(a), tb = tokenize(b);
  const m = ta.length, n = tb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = ta[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const left: DiffWord[] = [], right: DiffWord[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && ta[i] === tb[j]) {
      left.push({ text: ta[i], changed: false });
      right.push({ text: tb[j], changed: false });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      right.push({ text: tb[j], changed: true }); j++;
    } else {
      left.push({ text: ta[i], changed: true }); i++;
    }
  }
  return { left, right };
}

// ---------------------------------------------------------------------------
// Build structured diff lines
// ---------------------------------------------------------------------------

function buildDiffLines(raw: RawLine[], hideUnchanged: boolean): DiffLine[] {
  const lines: DiffLine[] = [];
  let leftNum = 1, rightNum = 1;
  let i = 0;

  while (i < raw.length) {
    const cur = raw[i];
    if (cur.op === 'equal') {
      if (!hideUnchanged) {
        lines.push({ type: 'unchanged', lineNumLeft: leftNum, lineNumRight: rightNum, content: cur.line });
      }
      leftNum++; rightNum++; i++;
    } else if (cur.op === 'delete') {
      // Check if next line is an insert → paired change → word diff
      const next = raw[i + 1];
      if (next && next.op === 'insert') {
        const { left, right } = wordDiff(cur.line, next.line);
        lines.push({ type: 'removed', lineNumLeft: leftNum, lineNumRight: null, content: cur.line, words: left });
        lines.push({ type: 'added', lineNumLeft: null, lineNumRight: rightNum, content: next.line, words: right });
        leftNum++; rightNum++; i += 2;
      } else {
        lines.push({ type: 'removed', lineNumLeft: leftNum, lineNumRight: null, content: cur.line });
        leftNum++; i++;
      }
    } else {
      lines.push({ type: 'added', lineNumLeft: null, lineNumRight: rightNum, content: cur.line });
      rightNum++; i++;
    }
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const diffCheckerProcessor: ToolProcessor = {
  inputLabel: 'Original Text',
  inputPlaceholder: 'Paste the original text here…',
  hasSecondaryInput: true,
  secondaryInputLabel: 'Changed Text',
  autoProcess: true,
  layoutVariant: 'diff',
  exampleInput: `The quick brown fox
jumps over
the lazy dog
Line four
Line five`,
  exampleSecondary: `The quick brown fox
jumps over
the very lazy cat
Line four
Line five
Line six`,
  optionControls: [
    { key: 'hideUnchanged', type: 'checkbox', label: 'Hide unchanged lines', defaultValue: false },
    { key: 'hideWhitespace', type: 'checkbox', label: 'Ignore whitespace', defaultValue: false },
  ],

  process(input: ToolInput): ToolResult {
    let a = input.value ?? '';
    let b = input.secondary ?? '';

    if (!a.trim() && !b.trim()) return { error: 'Paste text in both panels to compare.' };

    if (input.options?.hideWhitespace) {
      a = a.split('\n').map(l => l.trim()).join('\n');
      b = b.split('\n').map(l => l.trim()).join('\n');
    }

    const linesA = a.split('\n');
    const linesB = b.split('\n');

    if (linesA.length > 5000 || linesB.length > 5000) {
      return { error: 'Input too large — each side must be 5,000 lines or fewer.' };
    }

    const raw = lineDiff(linesA, linesB);
    const hideUnchanged = Boolean(input.options?.hideUnchanged);
    const diffLines = buildDiffLines(raw, hideUnchanged);

    const stats = {
      removed: diffLines.filter(l => l.type === 'removed').length,
      added: diffLines.filter(l => l.type === 'added').length,
      unchanged: diffLines.filter(l => l.type === 'unchanged').length,
    };

    const data: DiffData = { lines: diffLines, stats };

    return {
      output: {
        value: JSON.stringify(data),
        type: 'json',
        label: 'Diff',
        copyable: true,
        downloadFilename: 'diff.txt',
        downloadMime: 'text/plain',
      },
      meta: { added: stats.added, removed: stats.removed, unchanged: stats.unchanged },
    };
  },
};

export default diffCheckerProcessor;
