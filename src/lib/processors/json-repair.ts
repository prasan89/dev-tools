import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Repair helpers — each returns { result: string; repairs: string[] }
// ---------------------------------------------------------------------------

interface RepairStep {
  result: string;
  repairs: string[];
}

/** Remove JavaScript single-line and block comments. */
function removeComments(src: string): RepairStep {
  const repairs: string[] = [];

  // Block comments /* ... */ (non-greedy, may span lines)
  const afterBlock = src.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    repairs.push(`Removed block comment: ${match.slice(0, 40).replace(/\n/g, '\\n')}${match.length > 40 ? '…' : ''}`);
    return '';
  });

  // Line comments // ... (not inside strings — handled by full tokeniser below,
  // but a regex pass is good enough for the common case when quotes aren't tricky)
  const afterLine = afterBlock.replace(/\/\/[^\n]*/g, (match) => {
    repairs.push(`Removed line comment: ${match.slice(0, 60)}`);
    return '';
  });

  return { result: afterLine, repairs };
}

/** Convert hex numeric literals like 0x1A to their decimal equivalents. */
function replaceHexNumbers(src: string): RepairStep {
  const repairs: string[] = [];
  const result = src.replace(/\b0[xX][0-9a-fA-F]+\b/g, (match) => {
    const decimal = parseInt(match, 16);
    repairs.push(`Replaced hex literal ${match} → ${decimal}`);
    return String(decimal);
  });
  return { result, repairs };
}

/** Replace NaN, Infinity, -Infinity, undefined with null. */
function replaceSpecialLiterals(src: string): RepairStep {
  const repairs: string[] = [];

  const patterns: Array<[RegExp, string]> = [
    [/\bNaN\b/g, 'null'],
    [/\bInfinity\b/g, 'null'],
    [/-Infinity\b/g, 'null'],
    [/\bundefined\b/g, 'null'],
  ];

  let result = src;
  for (const [pattern, replacement] of patterns) {
    result = result.replace(pattern, (match) => {
      repairs.push(`Replaced ${match} → ${replacement}`);
      return replacement;
    });
  }
  return { result, repairs };
}

/** Remove trailing commas before } or ]. */
function removeTrailingCommas(src: string): RepairStep {
  const repairs: string[] = [];
  // Match comma(s) optionally followed by whitespace/newlines before ] or }
  const result = src.replace(/,(\s*[}\]])/g, (_, closing) => {
    repairs.push('Removed trailing comma');
    return closing;
  });
  return { result, repairs };
}

/**
 * Full tokeniser-based transform that handles:
 *  - Escaped single quotes \' inside strings
 *  - Single-quoted string values and keys → double-quoted
 *  - Unquoted object keys → double-quoted
 *  - Bare string values that look like words (limited heuristic)
 *  - Missing commas between items (very conservative heuristic)
 */
function tokeniserTransform(src: string): RepairStep {
  const repairs: string[] = [];
  let i = 0;
  let out = '';

  function peek(offset = 0): string {
    return src[i + offset] ?? '';
  }

  function skipWhitespace(): string {
    let ws = '';
    while (i < src.length && /\s/.test(src[i])) {
      ws += src[i++];
    }
    return ws;
  }

  /** Read a single-quoted string; returns the content without surrounding quotes. */
  function readSingleQuoted(): { content: string; repaired: boolean } {
    // i is currently at the opening '
    i++; // skip '
    let content = '';
    let repaired = false;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\\') {
        const next = peek(1);
        if (next === "'") {
          // escaped single quote inside single-quoted string
          content += "'";
          repairs.push("Replaced escaped single quote \\' → '");
          i += 2;
          repaired = true;
        } else {
          content += ch + next;
          i += 2;
        }
      } else if (ch === "'") {
        i++; // skip closing '
        break;
      } else if (ch === '"') {
        // double quote inside single-quoted — must escape it
        content += '\\"';
        i++;
        repaired = true;
      } else {
        content += ch;
        i++;
      }
    }
    return { content, repaired: true }; // always repaired (was single-quoted)
  }

  /** Read a double-quoted string; handle escaped single quotes inside. */
  function readDoubleQuoted(): { content: string; repaired: boolean } {
    // i is at opening "
    i++; // skip "
    let content = '';
    let repaired = false;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\\') {
        const next = peek(1);
        if (next === "'") {
          content += "'";
          repairs.push("Replaced escaped single quote \\' → '");
          i += 2;
          repaired = true;
        } else {
          content += ch + next;
          i += 2;
        }
      } else if (ch === '"') {
        i++; // skip closing "
        break;
      } else {
        content += ch;
        i++;
      }
    }
    return { content, repaired };
  }

  /**
   * Read an unquoted key/value token (letters, digits, _, -, ., $).
   * Returns the raw token.
   */
  function readBareword(): string {
    let token = '';
    while (i < src.length && /[A-Za-z0-9_\-.$]/.test(src[i])) {
      token += src[i++];
    }
    return token;
  }

  const JSON_KEYWORDS = new Set(['true', 'false', 'null']);

  while (i < src.length) {
    const ws = skipWhitespace();
    out += ws;

    if (i >= src.length) break;

    const ch = src[i];

    // Structural characters — pass through as-is
    if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === ':' || ch === ',') {
      out += ch;
      i++;
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      const { content, repaired } = readDoubleQuoted();
      if (repaired) {
        out += `"${content}"`;
      } else {
        out += `"${content}"`;
      }
      continue;
    }

    // Single-quoted string → convert to double-quoted
    if (ch === "'") {
      const { content } = readSingleQuoted();
      const escaped = content.replace(/"/g, '\\"');
      repairs.push(`Converted single-quoted string '${content.slice(0, 20)}${content.length > 20 ? '…' : ''}' to double quotes`);
      out += `"${escaped}"`;
      continue;
    }

    // Number (including negative)
    if (ch === '-' || /[0-9]/.test(ch)) {
      let num = '';
      if (ch === '-') { num += ch; i++; }
      while (i < src.length && /[0-9.eE+\-]/.test(src[i])) {
        num += src[i++];
      }
      out += num;
      continue;
    }

    // Bareword — could be an unquoted key (already past ':') or keyword or bare string
    if (/[A-Za-z_$]/.test(ch)) {
      const token = readBareword();

      if (JSON_KEYWORDS.has(token)) {
        // valid JSON keyword — pass through
        out += token;
      } else {
        // It's either an unquoted key or an unquoted string value
        // We can't perfectly distinguish here; wrap in double quotes
        repairs.push(`Quoted unquoted identifier: ${token}`);
        out += `"${token}"`;
      }
      continue;
    }

    // Anything else — pass through (e.g. newlines already consumed, stray chars)
    out += ch;
    i++;
  }

  return { result: out, repairs };
}

/** Very conservative missing-comma fixer: between a closing bracket/quote/literal and an opening one. */
function addMissingCommas(src: string): RepairStep {
  const repairs: string[] = [];
  // Between } or ] or " or number/true/false/null and the next { or [ or "
  const result = src.replace(
    /([\]}"]|true|false|null|-?\d(?:\.\d+)?(?:[eE][+-]?\d+)?)(\s+)([\[{"])/g,
    (match, before, ws, after) => {
      repairs.push('Added missing comma');
      return `${before},${ws}${after}`;
    }
  );
  return { result, repairs };
}

// ---------------------------------------------------------------------------
// Main repair pipeline
// ---------------------------------------------------------------------------

interface RepairResult {
  repairedSource: string;
  allRepairs: string[];
  wasValid: boolean;
  isValid: boolean;
  parseError: string | null;
}

function repairJSON(raw: string): RepairResult {
  // First, check if it's already valid
  let wasValid = false;
  try {
    JSON.parse(raw);
    wasValid = true;
  } catch {
    wasValid = false;
  }

  if (wasValid) {
    return {
      repairedSource: raw,
      allRepairs: [],
      wasValid: true,
      isValid: true,
      parseError: null,
    };
  }

  const allRepairs: string[] = [];

  // Pipeline of transforms
  let current = raw;

  const step1 = removeComments(current);
  current = step1.result;
  allRepairs.push(...step1.repairs);

  const step2 = replaceHexNumbers(current);
  current = step2.result;
  allRepairs.push(...step2.repairs);

  const step3 = replaceSpecialLiterals(current);
  current = step3.result;
  allRepairs.push(...step3.repairs);

  const step4 = removeTrailingCommas(current);
  current = step4.result;
  allRepairs.push(...step4.repairs);

  const step5 = tokeniserTransform(current);
  current = step5.result;
  allRepairs.push(...step5.repairs);

  const step6 = removeTrailingCommas(current); // re-run: tokeniser may expose more
  current = step6.result;
  allRepairs.push(...step6.repairs);

  const step7 = addMissingCommas(current);
  current = step7.result;
  allRepairs.push(...step7.repairs);

  // Final validation
  let isValid = false;
  let parseError: string | null = null;
  let repairedSource = current;
  try {
    const parsed = JSON.parse(current);
    isValid = true;
    repairedSource = JSON.stringify(parsed, null, 2);
  } catch (err) {
    parseError = err instanceof Error ? err.message : String(err);
  }

  return { repairedSource, allRepairs, wasValid, isValid, parseError };
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonRepairProcessor: ToolProcessor = {
  inputLabel: 'Broken JSON Input',
  inputPlaceholder: `{
  name: 'Alice',
  'age': 30,
  scores: [95, 87, 92,],
  active: true, // active user
}`,
  autoProcess: true,
  exampleInput: `{
  name: 'Alice',
  'role': "admin",
  scores: [95, 87, 92,],
  balance: NaN,
  active: true, // still active
  /* legacy field */
  ref: 0xFF
}`,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to repair.' };

    const { repairedSource, allRepairs, wasValid, isValid, parseError } = repairJSON(raw);

    if (wasValid) {
      return {
        output: {
          value: repairedSource,
          type: 'json',
          label: 'JSON (no repairs needed)',
          copyable: true,
          downloadFilename: 'repaired.json',
          downloadMime: 'application/json',
        },
        meta: {
          repairs_made: 0,
          was_valid: 'yes',
          is_valid: 'yes',
        },
      };
    }

    // Build repair summary
    const dedupedRepairs = deduplicateRepairs(allRepairs);
    const repairSummary = dedupedRepairs.length > 0
      ? dedupedRepairs.join('\n')
      : 'No specific repairs identified.';

    if (!isValid) {
      return {
        output: {
          value: repairedSource,
          type: 'json',
          label: 'Best-effort output (still invalid)',
          copyable: true,
          downloadFilename: 'repaired.json',
          downloadMime: 'application/json',
        },
        additionalOutputs: [
          {
            value: repairSummary,
            type: 'text',
            label: 'Repairs attempted',
          },
        ],
        error: `Could not fully repair JSON. Remaining error: ${parseError}`,
        meta: {
          repairs_made: allRepairs.length,
          was_valid: 'no',
          is_valid: 'no',
        },
      };
    }

    return {
      output: {
        value: repairedSource,
        type: 'json',
        label: 'Repaired JSON',
        copyable: true,
        downloadFilename: 'repaired.json',
        downloadMime: 'application/json',
      },
      additionalOutputs: [
        {
          value: repairSummary,
          type: 'text',
          label: 'Repairs made',
        },
      ],
      meta: {
        repairs_made: allRepairs.length,
        was_valid: 'no',
        is_valid: 'yes',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Collapse duplicate repair messages into "message (×N)" form. */
function deduplicateRepairs(repairs: string[]): string[] {
  const counts = new Map<string, number>();
  // Group by message prefix (strip variable parts for counting)
  const keys: string[] = [];
  for (const r of repairs) {
    // Normalise: strip variable parts for grouping
    const key = r
      .replace(/'[^']*'/g, "'…'")
      .replace(/"[^"]*"/g, '"…"')
      .replace(/\d+/g, 'N');
    if (!counts.has(key)) {
      counts.set(key, 0);
      keys.push(key);
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Reconstruct with counts, using original message for first occurrence
  const firstOccurrence = new Map<string, string>();
  for (const r of repairs) {
    const key = r
      .replace(/'[^']*'/g, "'…'")
      .replace(/"[^"]*"/g, '"…"')
      .replace(/\d+/g, 'N');
    if (!firstOccurrence.has(key)) firstOccurrence.set(key, r);
  }

  return keys.map((key) => {
    const count = counts.get(key) ?? 1;
    const msg = firstOccurrence.get(key) ?? key;
    return count > 1 ? `${msg} (×${count})` : msg;
  });
}
