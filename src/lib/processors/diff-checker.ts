import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// LCS-based line diff — no external dependencies.

type DiffOp = 'equal' | 'insert' | 'delete';

interface DiffLine {
  op: DiffOp;
  line: string;
  lineNo?: number; // line number in original for context
}

function computeLcs(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  // Build LCS table bottom-up
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function diff(a: string[], b: string[]): DiffLine[] {
  const dp = computeLcs(a, b);
  const result: DiffLine[] = [];
  let i = 0, j = 0;

  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ op: 'equal', line: a[i] });
      i++; j++;
    } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ op: 'insert', line: b[j] });
      j++;
    } else {
      result.push({ op: 'delete', line: a[i] });
      i++;
    }
  }
  return result;
}

function renderDiff(diffLines: DiffLine[]): string {
  const out: string[] = [];
  let lineA = 1, lineB = 1;
  let hasChanges = false;

  for (const d of diffLines) {
    switch (d.op) {
      case 'equal':
        out.push(`  ${String(lineA).padStart(4)} ${String(lineB).padStart(4)}  ${d.line}`);
        lineA++; lineB++;
        break;
      case 'delete':
        out.push(`- ${String(lineA).padStart(4)}       ${d.line}`);
        lineA++;
        hasChanges = true;
        break;
      case 'insert':
        out.push(`+       ${String(lineB).padStart(4)}  ${d.line}`);
        lineB++;
        hasChanges = true;
        break;
    }
  }

  if (!hasChanges) {
    return '(no differences found — the two texts are identical)';
  }

  return [
    '  ---- ----  (- removed  + added)',
    ...out,
  ].join('\n');
}

export const diffCheckerProcessor: ToolProcessor = {
  inputLabel: 'Original Text',
  inputPlaceholder: 'Paste the original text here…',
  hasSecondaryInput: true,
  secondaryInputLabel: 'Modified Text',
  autoProcess: true,
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

  process(input: ToolInput): ToolResult {
    const a = input.value ?? '';
    const b = input.secondary ?? '';

    if (!a.trim() && !b.trim()) {
      return { error: 'Paste text in both inputs to compare.' };
    }

    const linesA = a.split('\n');
    const linesB = b.split('\n');

    // Guard against enormous inputs to avoid hanging
    if (linesA.length > 5000 || linesB.length > 5000) {
      return { error: 'Input too large — each side must be 5 000 lines or fewer.' };
    }

    const diffLines = diff(linesA, linesB);
    const rendered = renderDiff(diffLines);

    const added = diffLines.filter((d) => d.op === 'insert').length;
    const removed = diffLines.filter((d) => d.op === 'delete').length;

    return {
      output: {
        value: rendered,
        type: 'text',
        label: 'Diff',
        copyable: true,
        downloadFilename: 'diff.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        added,
        removed,
        unchanged: diffLines.filter((d) => d.op === 'equal').length,
      },
    };
  },
};
