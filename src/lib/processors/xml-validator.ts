import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Uses browser DOMParser — same as xml-formatter.ts
function validateXml(xmlStr: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');
  const parseError =
    doc.documentElement?.tagName?.toLowerCase() === 'parsererror'
      ? doc.documentElement
      : doc.querySelector('parseerror');
  if (!parseError) return null;
  return (parseError.textContent ?? 'Unknown parse error').trim().split('\n').slice(0, 3).join('\n');
}

export const xmlValidatorProcessor: ToolProcessor = {
  inputLabel: 'XML Input',
  inputPlaceholder: 'Paste your XML here to validate…',
  autoProcess: true,
  exampleInput: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>12.99</price>
  </book>
</bookstore>`,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste XML to validate.' };

    const error = validateXml(raw);
    if (error) {
      return {
        output: {
          value: `✗ Invalid XML\n\n${error}`,
          type: 'text',
          label: 'Validation Error',
          copyable: true,
        },
        meta: { valid: 'no' },
      };
    }

    const lines = raw.split('\n').length;
    const bytes = new Blob([raw]).size;

    return {
      output: {
        value: '✓ Valid XML\n\nThe document is well-formed.',
        type: 'text',
        label: 'Validation Result',
        copyable: true,
      },
      meta: {
        valid: 'yes',
        lines,
        bytes,
      },
    };
  },
};
