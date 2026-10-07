import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

const MAX_INPUT_LENGTH = 50_000; // characters — guards against ReDoS on huge inputs
const MAX_MATCHES = 1000; // stop collecting after this many

function buildFlagsString(options: Record<string, unknown>): string {
  let flags = '';
  if (options['flag_g']) flags += 'g';
  if (options['flag_i']) flags += 'i';
  if (options['flag_m']) flags += 'm';
  if (options['flag_s']) flags += 's';
  if (options['flag_u']) flags += 'u';
  if (options['flag_y']) flags += 'y';
  return flags;
}

interface MatchInfo {
  index: number;
  text: string;
  groups: string[];
  namedGroups: Record<string, string>;
}

function runRegex(pattern: string, flags: string, testStr: string): MatchInfo[] {
  const re = new RegExp(pattern, flags);
  const matches: MatchInfo[] = [];

  if (!flags.includes('g') && !flags.includes('y')) {
    const m = re.exec(testStr);
    if (!m) return [];
    return [
      {
        index: m.index,
        text: m[0],
        groups: m.slice(1).map((g) => (g === undefined ? '<undefined>' : g)),
        namedGroups: (m.groups as Record<string, string> | undefined) ?? {},
      },
    ];
  }

  // Global / sticky — iterate but cap at MAX_MATCHES
  let m: RegExpExecArray | null;
  while ((m = re.exec(testStr)) !== null && matches.length < MAX_MATCHES) {
    matches.push({
      index: m.index,
      text: m[0],
      groups: m.slice(1).map((g) => (g === undefined ? '<undefined>' : g)),
      namedGroups: (m.groups as Record<string, string> | undefined) ?? {},
    });
    // Prevent infinite loop on zero-length match
    if (m[0].length === 0) re.lastIndex++;
  }
  return matches;
}

function formatMatches(matches: MatchInfo[], total: number, capped: boolean): string {
  const lines: string[] = [];
  const plural = total === 1 ? 'match' : 'matches';
  lines.push(`✓ ${total} ${plural} found${capped ? ` (showing first ${MAX_MATCHES})` : ''}`);
  lines.push('');

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    lines.push(`Match ${i + 1}`);
    lines.push(`  Text:  "${m.text}"`);
    lines.push(`  Index: ${m.index}–${m.index + m.text.length}`);

    if (m.groups.length > 0) {
      lines.push('  Capture groups:');
      m.groups.forEach((g, j) => {
        lines.push(`    Group ${j + 1}: ${g}`);
      });
    }

    const namedKeys = Object.keys(m.namedGroups);
    if (namedKeys.length > 0) {
      lines.push('  Named groups:');
      namedKeys.forEach((k) => {
        lines.push(`    ${k}: ${m.namedGroups[k]}`);
      });
    }
  }

  return lines.join('\n');
}

export const regexTesterProcessor: ToolProcessor = {
  inputLabel: 'Regex Pattern',
  inputPlaceholder: '\\b[A-Z][a-z]+\\b',
  autoProcess: false,
  exampleInput: '\\b[A-Z][a-z]+\\b',
  exampleSecondary: 'Hello from DevToolsHub. Java Spring Boot is great.',
  hasSecondaryInput: true,
  secondaryInputLabel: 'Test String',

  optionControls: [
    { key: 'flag_g', type: 'checkbox', label: 'g', defaultValue: true,  group: 'Flags' },
    { key: 'flag_i', type: 'checkbox', label: 'i', defaultValue: false, group: 'Flags' },
    { key: 'flag_m', type: 'checkbox', label: 'm', defaultValue: false, group: 'Flags' },
    { key: 'flag_s', type: 'checkbox', label: 's', defaultValue: false, group: 'Flags' },
    { key: 'flag_u', type: 'checkbox', label: 'u', defaultValue: false, group: 'Flags' },
    { key: 'flag_y', type: 'checkbox', label: 'y', defaultValue: false, group: 'Flags' },
  ],

  process(input: ToolInput): ToolResult {
    const pattern = input.value;
    const testStr = input.secondary ?? '';
    const opts = input.options ?? {};

    if (!pattern) return { error: 'Enter a regular expression pattern.' };
    if (testStr.length > MAX_INPUT_LENGTH) {
      return { error: `Test string is too long (${testStr.length} chars). Maximum is ${MAX_INPUT_LENGTH}.` };
    }

    const flags = buildFlagsString(opts);

    // Validate pattern first
    let re: RegExp;
    try {
      re = new RegExp(pattern, flags);
      void re; // suppress unused warning
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid regular expression';
      // Strip stack trace prefix if present
      const clean = msg.replace(/^SyntaxError:\s*/i, '');
      return { error: `✕ Invalid regular expression\n\n${clean}` };
    }

    if (!testStr) {
      return {
        output: {
          value: 'Pattern is valid. Enter a test string to find matches.',
          type: 'text',
          label: 'Result',
          copyable: false,
        },
        meta: { pattern, flags: flags || '(none)' },
      };
    }

    let matches: MatchInfo[];
    try {
      matches = runRegex(pattern, flags, testStr);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error running regex';
      return { error: msg.replace(/^SyntaxError:\s*/i, '') };
    }

    if (matches.length === 0) {
      return {
        output: {
          value: `✕ No matches found`,
          type: 'text',
          label: 'Result',
          copyable: false,
        },
        meta: { pattern, flags: flags || '(none)', matches: 0 },
      };
    }

    const capped = matches.length >= MAX_MATCHES;
    const output = formatMatches(matches, matches.length, capped);

    return {
      output: {
        value: output,
        type: 'text',
        label: 'Matches',
        copyable: true,
        downloadFilename: 'regex-matches.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        pattern,
        flags: flags || '(none)',
        matches: matches.length,
      },
    };
  },
};
