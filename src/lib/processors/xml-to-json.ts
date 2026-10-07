import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// XML → JSON mapping rules:
// - Element with only text → string value
// - Element with children → object
// - Repeated sibling elements → array
// - Attributes → object keys prefixed with "@"
// - Mixed content (text + children) → "#text" key for text content
// - CDATA → treated as text

function nodeToJson(node: Element): unknown {
  const result: Record<string, unknown> = {};
  let hasChildren = false;

  // Attributes
  for (const attr of Array.from(node.attributes)) {
    result[`@${attr.name}`] = attr.value;
  }

  // Child elements
  const childElements = Array.from(node.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  ) as Element[];

  if (childElements.length > 0) {
    hasChildren = true;
    // Group by tag name to detect arrays
    const groups: Record<string, Element[]> = {};
    for (const child of childElements) {
      if (!groups[child.tagName]) groups[child.tagName] = [];
      groups[child.tagName].push(child);
    }
    for (const [tag, children] of Object.entries(groups)) {
      if (children.length === 1) {
        result[tag] = nodeToJson(children[0]);
      } else {
        result[tag] = children.map(nodeToJson);
      }
    }
  }

  // Text content (only if no child elements, or mixed content)
  const textContent = Array.from(node.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map((n) => n.textContent ?? '')
    .join('')
    .trim();

  if (textContent) {
    if (hasChildren || Object.keys(result).length > 0) {
      result['#text'] = textContent;
    } else {
      // Pure text element with no attributes/children
      if (Object.keys(result).length === 0) {
        return textContent;
      }
      result['#text'] = textContent;
    }
  }

  // If only one @attribute and that attribute has no value... return primitive
  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
}

function xmlToJson(xmlStr: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');

  const parseError =
    doc.documentElement?.tagName?.toLowerCase() === 'parsererror'
      ? doc.documentElement
      : doc.querySelector('parseerror');
  if (parseError) {
    throw new Error((parseError.textContent ?? 'Unknown parse error').trim().split('\n').slice(0, 3).join('\n'));
  }

  const root = doc.documentElement;
  const rootJson: Record<string, unknown> = {};
  rootJson[root.tagName] = nodeToJson(root);
  return rootJson;
}

export const xmlToJsonProcessor: ToolProcessor = {
  inputLabel: 'XML Input',
  inputPlaceholder: 'Paste your XML to convert to JSON…',
  autoProcess: true,
  exampleInput: `<?xml version="1.0"?>
<store>
  <book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>12.99</price>
  </book>
  <book id="2" category="classic">
    <title>Moby Dick</title>
    <author>Herman Melville</author>
    <price>9.99</price>
  </book>
</store>`,

  optionControls: [
    {
      key: 'indent',
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
    if (!raw) return { error: 'Paste XML to convert.' };

    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);

    let json: unknown;
    try {
      json = xmlToJson(raw);
    } catch (err) {
      return { error: `Invalid XML:\n\n${err instanceof Error ? err.message : String(err)}` };
    }

    const output = JSON.stringify(json, null, indent);

    return {
      output: {
        value: output,
        type: 'json',
        label: 'JSON Output',
        copyable: true,
        downloadFilename: 'converted.json',
        downloadMime: 'application/json',
      },
      meta: {
        'input bytes': raw.length,
        'output bytes': output.length,
        note: 'Attributes prefixed @, repeated elements become arrays, text nodes use #text',
      },
    };
  },
};
