import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// JSON → XML conversion
//
// Mapping rules (shown in UI via exampleInput):
//   Object  → child elements, one per key
//   Array   → repeated elements using the parent key name (or <item> fallback)
//   String  → text content
//   Number  → text content
//   Boolean → text content ("true" / "false")
//   null    → self-closing element with xsi:nil="true"
//
// Keys that are not valid XML names are sanitized (leading digit → _ prefix,
// invalid chars replaced with _).
// ---------------------------------------------------------------------------

function escapeXmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// XML 1.0 name rules: start char must be letter, _, or colon
function sanitizeXmlName(name: string): string {
  if (!name) return '_empty';
  // Replace any character that isn't letter/digit/hyphen/underscore/dot/colon
  let sanitized = name.replace(/[^a-zA-Z0-9\-_.:/]/g, '_');
  // XML name cannot start with digit, hyphen, or dot
  if (/^[0-9\-.]/.test(sanitized)) {
    sanitized = '_' + sanitized;
  }
  return sanitized;
}

function jsonValueToXml(value: unknown, tagName: string, depth: number, indent: number): string {
  const pad = ' '.repeat(depth * indent);
  const safeTag = sanitizeXmlName(tagName);

  if (value === null || value === undefined) {
    return `${pad}<${safeTag} xsi:nil="true"/>`;
  }

  if (Array.isArray(value)) {
    // Render each item as a repeated element with the same tag
    if (value.length === 0) {
      return `${pad}<${safeTag}/>`;
    }
    return value
      .map((item) => jsonValueToXml(item, safeTag, depth, indent))
      .join('\n');
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return `${pad}<${safeTag}/>`;
    }
    const inner = entries
      .map(([k, v]) => {
        // Arrays: use the parent key as the repeated element name
        if (Array.isArray(v)) {
          return v
            .map((item) => jsonValueToXml(item, k, depth + 1, indent))
            .join('\n');
        }
        return jsonValueToXml(v, k, depth + 1, indent);
      })
      .join('\n');
    return `${pad}<${safeTag}>\n${inner}\n${pad}</${safeTag}>`;
  }

  // Primitives: string, number, boolean
  const text = escapeXmlText(String(value));
  return `${pad}<${safeTag}>${text}</${safeTag}>`;
}

export const jsonToXmlProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste JSON here…',
  autoProcess: true,
  exampleInput: JSON.stringify(
    {
      user: {
        name: 'Alice',
        age: 30,
        active: true,
        address: {
          city: 'New York',
          country: 'US',
        },
        tags: ['developer', 'designer'],
      },
    },
    null,
    2
  ),

  optionControls: [
    {
      key: 'rootElement',
      type: 'select',
      label: 'Root element',
      defaultValue: 'root',
      options: [
        { value: 'root', label: '<root>' },
        { value: 'data', label: '<data>' },
        { value: 'document', label: '<document>' },
        { value: 'none', label: 'None (use JSON key)' },
      ],
    },
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
    if (!raw) return { error: 'Paste JSON to convert.' };

    const rootElement = String(input.options?.['rootElement'] ?? 'root');
    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: 'Invalid JSON — please check your input.' };
    }

    let body: string;

    if (rootElement === 'none') {
      // Top-level must be an object when no wrapper is used
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {
          error:
            'When "Root element: None" is selected, the JSON must be an object. Select a root element wrapper to convert arrays or primitives.',
        };
      }
      const entries = Object.entries(parsed as Record<string, unknown>);
      body = entries
        .map(([k, v]) => {
          if (Array.isArray(v)) {
            return v.map((item) => jsonValueToXml(item, k, 0, indent)).join('\n');
          }
          return jsonValueToXml(v, k, 0, indent);
        })
        .join('\n');
    } else {
      body = jsonValueToXml(parsed, rootElement, 0, indent);
    }

    const nsDecl =
      body.includes('xsi:nil')
        ? ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
        : '';

    // Inject namespace declaration into the outermost element if needed
    let xml: string;
    if (rootElement === 'none') {
      xml = `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
    } else {
      // Insert namespace into first opening tag
      xml = `<?xml version="1.0" encoding="UTF-8"?>\n${body.replace(/^(<\w[^>]*)>/, `$1${nsDecl}>`)}`;
    }

    return {
      output: {
        value: xml,
        type: 'text',
        label: 'XML Output',
        copyable: true,
        downloadFilename: 'output.xml',
        downloadMime: 'application/xml',
      },
      meta: {
        'input bytes': raw.length,
        'output bytes': xml.length,
      },
    };
  },
};
