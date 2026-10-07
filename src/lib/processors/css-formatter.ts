import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Pure-JS CSS formatter — no external deps.
// Strategy: track brace depth to distinguish selectors from declarations.

function formatCss(css: string, tabWidth: number): string {
  const ind = (d: number) => ' '.repeat(d * tabWidth);
  const lines: string[] = [];
  let depth = 0;
  let i = 0;
  const n = css.length;

  const skipWs = () => {
    while (i < n && /\s/.test(css[i])) i++;
  };

  // Read until stopChars (respects quoted strings)
  const readUntil = (stopChars: string[]): string => {
    let buf = '';
    let inStr: string | null = null;
    let parenDepth = 0;
    while (i < n) {
      const c = css[i];
      if (inStr) {
        buf += c; i++;
        if (c === inStr) inStr = null;
      } else if (c === '(' ) {
        parenDepth++; buf += c; i++;
      } else if (c === ')') {
        parenDepth--; buf += c; i++;
      } else if (parenDepth > 0) {
        buf += c; i++;
      } else if (c === '"' || c === "'") {
        inStr = c; buf += c; i++;
      } else if (stopChars.includes(c)) {
        break;
      } else {
        buf += c; i++;
      }
    }
    return buf;
  };

  while (i < n) {
    skipWs();
    if (i >= n) break;

    // Block comment
    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const comment = end === -1 ? css.slice(i) : css.slice(i, end + 2);
      lines.push(`${ind(depth)}${comment.trim()}`);
      i = end === -1 ? n : end + 2;
      continue;
    }

    // Closing brace
    if (css[i] === '}') {
      depth = Math.max(0, depth - 1);
      lines.push(`${ind(depth)}}`);
      i++;
      continue;
    }

    // Read a chunk until { ; } or end
    const chunk = readUntil(['{', '}', ';']);
    const trimmed = chunk.trim();

    if (i >= n) {
      if (trimmed) lines.push(`${ind(depth)}${trimmed}`);
      break;
    }

    if (css[i] === '{') {
      i++; // consume {
      lines.push(`${ind(depth)}${trimmed} {`);
      depth++;
      continue;
    }

    if (css[i] === ';') {
      i++; // consume ;
      if (trimmed) lines.push(`${ind(depth)}${trimmed};`);
      continue;
    }

    if (css[i] === '}') {
      // Property missing trailing semicolon before }
      if (trimmed) lines.push(`${ind(depth)}${trimmed};`);
      // Don't consume } — loop will handle it
      continue;
    }
  }

  return lines.filter((l) => l.trim().length > 0).join('\n');
}

export const cssFormatterProcessor: ToolProcessor = {
  inputLabel: 'CSS Input',
  inputPlaceholder: 'Paste your CSS here…',
  autoProcess: true,
  exampleInput: `.container{display:flex;align-items:center;gap:16px}.button{background:#1a73e8;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer}.button:hover{background:#1557b0}@media(max-width:768px){.container{flex-direction:column}}`,

  optionControls: [
    {
      key: 'tabWidth',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste CSS to format.' };

    const tabWidth = parseInt(String(input.options?.['tabWidth'] ?? '2'), 10);

    let formatted: string;
    try {
      formatted = formatCss(raw, tabWidth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Formatting error';
      return { error: `Could not format CSS:\n\n${msg}` };
    }

    return {
      output: {
        value: formatted,
        type: 'text',
        label: 'Formatted CSS',
        copyable: true,
        downloadFilename: 'formatted.css',
        downloadMime: 'text/css',
      },
      meta: {
        indent: `${tabWidth} spaces`,
        'input bytes': raw.length,
        'output bytes': formatted.length,
      },
    };
  },
};
