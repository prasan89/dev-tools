import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Minimal but correct HTML formatter — pure JS, no external deps.
// Strategy:
//   1. Tokenise the input into tags / text / comments / doctypes / self-closing.
//   2. Manage an indent stack.
//   3. Void elements are never closed.

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

// Inline elements that should not add extra newlines
const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite',
  'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map',
  'object', 'output', 'q', 's', 'samp', 'select', 'small', 'span',
  'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var',
]);

type Token =
  | { kind: 'doctype'; raw: string }
  | { kind: 'comment'; raw: string }
  | { kind: 'open'; tag: string; attrs: string; selfClose: boolean }
  | { kind: 'close'; tag: string }
  | { kind: 'text'; value: string }
  | { kind: 'script' | 'style'; tag: string; attrs: string; content: string };

function tokenise(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = html.length;

  while (i < n) {
    if (html[i] !== '<') {
      let end = html.indexOf('<', i);
      if (end === -1) end = n;
      const text = html.slice(i, end).replace(/\s+/g, ' ').trim();
      if (text) tokens.push({ kind: 'text', value: text });
      i = end;
      continue;
    }

    // Comment
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      if (end === -1) { i = n; break; }
      tokens.push({ kind: 'comment', raw: html.slice(i, end + 3) });
      i = end + 3;
      continue;
    }

    // Doctype
    if (html.slice(i, i + 9).toLowerCase() === '<!doctype') {
      const end = html.indexOf('>', i);
      tokens.push({ kind: 'doctype', raw: html.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Closing tag
    if (html[i + 1] === '/') {
      const end = html.indexOf('>', i);
      const tag = html.slice(i + 2, end).trim().toLowerCase();
      tokens.push({ kind: 'close', tag });
      i = end + 1;
      continue;
    }

    // Opening / self-closing tag — find the closing >
    let end = i + 1;
    let inStr: string | null = null;
    while (end < n) {
      const c = html[end];
      if (inStr) {
        if (c === inStr) inStr = null;
      } else {
        if (c === '"' || c === "'") inStr = c;
        else if (c === '>') break;
      }
      end++;
    }
    const raw = html.slice(i + 1, end); // strip < and >
    const selfClose = raw.endsWith('/');
    const tagContent = selfClose ? raw.slice(0, -1).trim() : raw.trim();
    const spaceIdx = tagContent.search(/\s/);
    const tag = (spaceIdx === -1 ? tagContent : tagContent.slice(0, spaceIdx)).toLowerCase();
    const attrs = spaceIdx === -1 ? '' : tagContent.slice(spaceIdx + 1).trim();

    // script / style: capture raw content until </script> or </style>
    if (tag === 'script' || tag === 'style') {
      const closeTag = `</${tag}`;
      const contentStart = end + 1;
      const contentEnd = html.toLowerCase().indexOf(closeTag, contentStart);
      const content = contentEnd === -1 ? '' : html.slice(contentStart, contentEnd);
      tokens.push({ kind: tag, tag, attrs, content });
      i = contentEnd === -1 ? n : contentEnd + closeTag.length + 1;
      continue;
    }

    tokens.push({ kind: 'open', tag, attrs, selfClose });
    i = end + 1;
  }
  return tokens;
}

function formatHtml(html: string, tabWidth: number): string {
  const indent = (depth: number) => ' '.repeat(depth * tabWidth);
  const tokens = tokenise(html);
  const lines: string[] = [];
  let depth = 0;

  for (const tok of tokens) {
    switch (tok.kind) {
      case 'doctype':
        lines.push(`${indent(depth)}${tok.raw}`);
        break;
      case 'comment':
        lines.push(`${indent(depth)}${tok.raw}`);
        break;
      case 'open': {
        const isVoid = VOID_ELEMENTS.has(tok.tag) || tok.selfClose;
        const attrsStr = tok.attrs ? ` ${tok.attrs}` : '';
        const close = isVoid ? (tok.selfClose ? ' />' : '>') : '>';
        lines.push(`${indent(depth)}<${tok.tag}${attrsStr}${close}`);
        if (!isVoid) depth++;
        break;
      }
      case 'close':
        depth = Math.max(0, depth - 1);
        if (!INLINE_ELEMENTS.has(tok.tag)) {
          lines.push(`${indent(depth)}</${tok.tag}>`);
        } else {
          const last = lines[lines.length - 1];
          if (last !== undefined) lines[lines.length - 1] = last + `</${tok.tag}>`;
          else lines.push(`${indent(depth)}</${tok.tag}>`);
        }
        break;
      case 'text':
        lines.push(`${indent(depth)}${tok.value}`);
        break;
      case 'script':
      case 'style': {
        const attrsStr = tok.attrs ? ` ${tok.attrs}` : '';
        lines.push(`${indent(depth)}<${tok.tag}${attrsStr}>`);
        if (tok.content.trim()) {
          // Indent the content block
          const contentLines = tok.content.trim().split('\n');
          for (const cl of contentLines) {
            lines.push(`${indent(depth + 1)}${cl.trim()}`);
          }
        }
        lines.push(`${indent(depth)}</${tok.tag}>`);
        break;
      }
    }
  }

  return lines.filter((l) => l.trim().length > 0).join('\n');
}

export const htmlFormatterProcessor: ToolProcessor = {
  inputLabel: 'HTML Input',
  inputPlaceholder: 'Paste your HTML here…',
  autoProcess: true,
  exampleInput: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Example</title></head><body><h1>Hello World</h1><p>This is a <strong>paragraph</strong> with <em>formatting</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul></body></html>`,

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
    if (!raw) return { error: 'Paste HTML to format.' };

    const tabWidth = parseInt(String(input.options?.['tabWidth'] ?? '2'), 10);

    let formatted: string;
    try {
      formatted = formatHtml(raw, tabWidth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Formatting error';
      return { error: `Could not format HTML:\n\n${msg}` };
    }

    return {
      output: {
        value: formatted,
        type: 'text',
        label: 'Formatted HTML',
        copyable: true,
        downloadFilename: 'formatted.html',
        downloadMime: 'text/html',
      },
      meta: {
        indent: `${tabWidth} spaces`,
        'input bytes': raw.length,
        'output bytes': formatted.length,
      },
    };
  },
};
