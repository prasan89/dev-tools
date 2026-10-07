import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function minifyXml(xmlStr: string, stripComments: boolean): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');

  const parseError =
    doc.documentElement?.tagName?.toLowerCase() === 'parsererror'
      ? doc.documentElement
      : doc.querySelector('parseerror');
  if (parseError) {
    throw new Error((parseError.textContent ?? 'Unknown parse error').trim().split('\n').slice(0, 3).join('\n'));
  }

  const parts: string[] = [];
  serializeMinified(doc, parts, stripComments);
  return parts.join('');
}

function serializeMinified(node: Node, parts: string[], stripComments: boolean): void {
  switch (node.nodeType) {
    case Node.DOCUMENT_NODE: {
      for (const child of Array.from(node.childNodes)) {
        serializeMinified(child, parts, stripComments);
      }
      break;
    }
    case Node.PROCESSING_INSTRUCTION_NODE: {
      const pi = node as ProcessingInstruction;
      parts.push(`<?${pi.target} ${pi.data}?>`);
      break;
    }
    case Node.ELEMENT_NODE: {
      const el = node as Element;
      const attrs = Array.from(el.attributes)
        .map((a) => ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`)
        .join('');
      const children = Array.from(el.childNodes);
      if (children.length === 0) {
        parts.push(`<${el.tagName}${attrs}/>`);
      } else {
        parts.push(`<${el.tagName}${attrs}>`);
        for (const child of children) serializeMinified(child, parts, stripComments);
        parts.push(`</${el.tagName}>`);
      }
      break;
    }
    case Node.TEXT_NODE: {
      const text = (node.textContent ?? '').trim();
      if (text) parts.push(text);
      break;
    }
    case Node.CDATA_SECTION_NODE: {
      parts.push(`<![CDATA[${node.textContent}]]>`);
      break;
    }
    case Node.COMMENT_NODE: {
      if (!stripComments) parts.push(`<!--${node.textContent}-->`);
      break;
    }
    default:
      break;
  }
}

export const xmlMinifierProcessor: ToolProcessor = {
  inputLabel: 'XML Input',
  inputPlaceholder: 'Paste your XML to minify…',
  autoProcess: true,
  exampleInput: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <!-- A comment -->
  <item id="1">
    <name>Example</name>
    <value>42</value>
  </item>
</root>`,

  optionControls: [
    {
      key: 'stripComments',
      type: 'checkbox',
      label: 'Remove comments',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste XML to minify.' };

    const stripComments = Boolean(input.options?.['stripComments']);

    let minified: string;
    try {
      minified = minifyXml(raw, stripComments);
    } catch (err) {
      return { error: `Invalid XML:\n\n${err instanceof Error ? err.message : String(err)}` };
    }

    const savings = Math.round((1 - minified.length / raw.length) * 100);

    return {
      output: {
        value: minified,
        type: 'text',
        label: 'Minified XML',
        copyable: true,
        downloadFilename: 'minified.xml',
        downloadMime: 'application/xml',
      },
      meta: {
        'original bytes': raw.length,
        'minified bytes': minified.length,
        'savings': `${savings}%`,
      },
    };
  },
};
