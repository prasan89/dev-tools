import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function indentStr(n: number): string {
  return ' '.repeat(n);
}

// Parse + pretty-print XML using browser DOMParser (available in jsdom too)
function formatXml(xmlStr: string, tabWidth: number): string {
  // DOMParser available in browser and jsdom
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');

  // Check for parse errors — parseerror may be the root element OR a descendant
  const parseError =
    doc.documentElement?.tagName?.toLowerCase() === 'parsererror'
      ? doc.documentElement
      : doc.querySelector('parseerror');
  if (parseError) {
    // Extract the human-readable error text
    const errorText = parseError.textContent ?? 'Unknown parse error';
    // Typically looks like: "error on line N at column M: ..."
    throw new Error(errorText.trim().split('\n').slice(0, 3).join('\n'));
  }

  const lines: string[] = [];
  serializeNode(doc, lines, 0, tabWidth);
  return lines.join('\n').trim();
}

function serializeNode(node: Node, lines: string[], depth: number, tabWidth: number): void {
  const indent = indentStr(depth * tabWidth);

  switch (node.nodeType) {
    case Node.DOCUMENT_NODE: {
      const docNode = node as Document;
      // Emit XML declaration if present (not accessible via DOM easily — check original)
      for (const child of Array.from(docNode.childNodes)) {
        serializeNode(child, lines, depth, tabWidth);
      }
      break;
    }
    case Node.PROCESSING_INSTRUCTION_NODE: {
      const pi = node as ProcessingInstruction;
      if (pi.target === 'xml') {
        lines.push(`${indent}<?xml ${pi.data}?>`);
      } else {
        lines.push(`${indent}<?${pi.target} ${pi.data}?>`);
      }
      break;
    }
    case Node.ELEMENT_NODE: {
      const el = node as Element;
      const tagName = el.tagName;
      const attrs = Array.from(el.attributes)
        .map((a) => ` ${a.name}="${escapeAttr(a.value)}"`)
        .join('');

      const children = Array.from(el.childNodes);
      const hasChildren = children.length > 0;

      if (!hasChildren) {
        lines.push(`${indent}<${tagName}${attrs}/>`);
        return;
      }

      // Check if all children are text nodes (inline element)
      const allText = children.every(
        (c) => c.nodeType === Node.TEXT_NODE || c.nodeType === Node.CDATA_SECTION_NODE
      );
      if (allText) {
        const text = children
          .map((c) =>
            c.nodeType === Node.CDATA_SECTION_NODE
              ? `<![CDATA[${c.textContent}]]>`
              : escapeText(c.textContent ?? '')
          )
          .join('');
        lines.push(`${indent}<${tagName}${attrs}>${text}</${tagName}>`);
        return;
      }

      lines.push(`${indent}<${tagName}${attrs}>`);
      for (const child of children) {
        serializeNode(child, lines, depth + 1, tabWidth);
      }
      lines.push(`${indent}</${tagName}>`);
      break;
    }
    case Node.TEXT_NODE: {
      const text = (node.textContent ?? '').trim();
      if (text) lines.push(`${indent}${escapeText(text)}`);
      break;
    }
    case Node.CDATA_SECTION_NODE: {
      lines.push(`${indent}<![CDATA[${node.textContent}]]>`);
      break;
    }
    case Node.COMMENT_NODE: {
      lines.push(`${indent}<!--${node.textContent}-->`);
      break;
    }
    default:
      break;
  }
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export const xmlFormatterProcessor: ToolProcessor = {
  inputLabel: 'XML Input',
  inputPlaceholder: 'Paste your XML here…',
  autoProcess: true,
  exampleInput: '<users><user id="1"><name>John</name><email>john@example.com</email></user><user id="2"><name>Jane</name><email>jane@example.com</email></user></users>',

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
    if (!raw) return { error: 'Paste XML to format.' };

    const tabWidth = parseInt(String(input.options?.['tabWidth'] ?? '2'), 10);

    let formatted: string;
    try {
      formatted = formatXml(raw, tabWidth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'XML parse error';
      return { error: `Invalid XML:\n\n${msg}` };
    }

    return {
      output: {
        value: formatted,
        type: 'text',
        label: 'Formatted XML',
        copyable: true,
        downloadFilename: 'formatted.xml',
        downloadMime: 'application/xml',
      },
      meta: {
        indent: `${tabWidth} spaces`,
        'input bytes': raw.length,
        'output bytes': formatted.length,
      },
    };
  },
};
