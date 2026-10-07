import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Markdown → safe HTML
// Pure JS CommonMark subset — no external deps, no raw HTML injection risk.
// The output is a plain text representation of the rendered content
// stored as type 'text', NOT 'html', so ToolOutput renders it safely in <pre>.
//
// For a rich rendered preview the UI would need to opt-in explicitly.
// Here we convert Markdown to readable structured text output.

// ----- Inline renderer -----
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(s: string): string {
  // Process bold+italic first (three stars/underscores), then bold, then italic
  // to avoid partial matches
  let out = s;
  out = out.replace(/`([^`]+)`/g, (_, code) => `\`${code}\``);     // inline code
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, (_, t) => `***${t}***`); // bold+italic ***
  out = out.replace(/___(.+?)___/g, (_, t) => `***${t}***`);
  out = out.replace(/\*\*(.+?)\*\*/g, (_, t) => `**${t}**`);       // bold **
  out = out.replace(/__(.+?)__/g, (_, t) => `**${t}**`);
  // italic: only match single * or _ that are not part of ** or __
  out = out.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, (_, t) => `_${t}_`);
  out = out.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, (_, t) => `_${t}_`);
  out = out.replace(/~~(.+?)~~/g, (_, t) => `~~${t}~~`);            // strikethrough
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `${text} (${url})`); // links
  return out;
}

// ----- Block-level parser -----
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const raw = line;

    // Blank line
    if (raw.trim() === '') {
      out.push('');
      i++;
      continue;
    }

    // ATX headings
    const headingMatch = raw.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2].trim());
      const prefix = '#'.repeat(level) + ' ';
      out.push(prefix + text);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(raw.trim())) {
      out.push('─'.repeat(40));
      i++;
      continue;
    }

    // Fenced code block
    if (/^```/.test(raw)) {
      const fence = raw.match(/^(`{3,})/)?.[1] ?? '```';
      const lang = raw.slice(fence.length).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(`\`\`\`${lang ? ' ' + lang : ''}`);
      for (const cl of codeLines) out.push(cl);
      out.push('```');
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(raw)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push('│ ' + renderInline(lines[i].replace(/^>\s?/, '')));
        i++;
      }
      out.push(...quoteLines);
      continue;
    }

    // Unordered list
    if (/^[\-*+]\s/.test(raw.trim())) {
      while (i < lines.length && /^\s*[\-*+]\s/.test(lines[i])) {
        const item = lines[i].replace(/^\s*[\-*+]\s/, '');
        const indentLevel = (lines[i].match(/^(\s*)/)?.[1].length ?? 0) / 2;
        out.push('  '.repeat(indentLevel) + '• ' + renderInline(item));
        i++;
      }
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(raw.trim())) {
      let num = 1;
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const item = lines[i].replace(/^\s*\d+\.\s/, '');
        out.push(`${num}. ${renderInline(item)}`);
        num++; i++;
      }
      continue;
    }

    // Setext heading (=== / ---)
    if (i + 1 < lines.length) {
      const next = lines[i + 1];
      if (/^=+\s*$/.test(next)) {
        out.push('# ' + renderInline(raw.trim()));
        i += 2; continue;
      }
      if (/^-+\s*$/.test(next) && next.length >= 2) {
        out.push('## ' + renderInline(raw.trim()));
        i += 2; continue;
      }
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[\-*+]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      out.push(renderInline(paraLines.join(' ').trim()));
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export const markdownPreviewProcessor: ToolProcessor = {
  inputLabel: 'Markdown Input',
  inputPlaceholder: 'Type or paste Markdown here…',
  autoProcess: true,
  exampleInput: `# Hello World

This is **bold** and _italic_ text with \`inline code\`.

## Features

- Unordered lists
- **Bold items**
- Nested content

1. Ordered lists
2. Auto-numbered

> Blockquotes look like this.

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

[Visit example.com](https://example.com)

---

End of document.`,

  process(input: ToolInput): ToolResult {
    const raw = input.value;
    if (!raw.trim()) return { error: 'Paste Markdown to preview.' };

    let rendered: string;
    try {
      rendered = renderMarkdown(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Rendering error';
      return { error: `Could not render Markdown:\n\n${msg}` };
    }

    const wordCount = raw.trim().split(/\s+/).length;
    const lineCount = raw.split('\n').length;

    return {
      output: {
        value: rendered,
        type: 'text',
        label: 'Rendered Preview',
        copyable: true,
        downloadFilename: 'preview.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'input words': wordCount,
        'input lines': lineCount,
        'output lines': rendered.split('\n').length,
      },
    };
  },
};

// Export escapeHtml for tests
export { escapeHtml };
