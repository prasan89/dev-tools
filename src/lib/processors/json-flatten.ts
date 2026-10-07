import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeparator(options?: Record<string, unknown>): string {
  const sep = options?.separator;
  if (sep === 'slash') return '/';
  if (sep === 'underscore') return '_';
  return '.';
}

function getIndent(options?: Record<string, unknown>): number {
  return options?.indent === 4 ? 4 : 2;
}

function shouldFlattenArrays(options?: Record<string, unknown>): boolean {
  const val = options?.flattenArrays;
  return val !== false; // default true
}

// ---------------------------------------------------------------------------
// Flatten
// ---------------------------------------------------------------------------

function flattenObject(
  obj: unknown,
  separator: string,
  flattenArrays: boolean,
  prefix = '',
  result: Record<string, unknown> = {},
  depth = 0,
): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    result[prefix] = obj;
    return result;
  }

  if (Array.isArray(obj)) {
    if (!flattenArrays || obj.length === 0) {
      result[prefix] = obj;
      return result;
    }
    obj.forEach((item, index) => {
      const key = prefix ? `${prefix}[${index}]` : `[${index}]`;
      if (item !== null && typeof item === 'object') {
        flattenObject(item, separator, flattenArrays, key, result, depth + 1);
      } else {
        result[key] = item;
      }
    });
    return result;
  }

  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record);

  if (keys.length === 0) {
    if (prefix) result[prefix] = {};
    return result;
  }

  keys.forEach((k) => {
    const newKey = prefix ? `${prefix}${separator}${k}` : k;
    const val = record[k];
    if (val !== null && typeof val === 'object') {
      flattenObject(val, separator, flattenArrays, newKey, result, depth + 1);
    } else {
      result[newKey] = val;
    }
  });

  return result;
}

function maxDepth(obj: unknown, current = 0): number {
  if (obj === null || typeof obj !== 'object') return current;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return current;
    return Math.max(...obj.map((v) => maxDepth(v, current + 1)));
  }
  const vals = Object.values(obj as Record<string, unknown>);
  if (vals.length === 0) return current;
  return Math.max(...vals.map((v) => maxDepth(v, current + 1)));
}

// ---------------------------------------------------------------------------
// Unflatten
// ---------------------------------------------------------------------------

function setNestedValue(
  obj: Record<string, unknown>,
  keyPath: string[],
  value: unknown,
): void {
  let cursor: Record<string, unknown> = obj;

  for (let i = 0; i < keyPath.length - 1; i++) {
    const segment = keyPath[i];
    const nextSegment = keyPath[i + 1];
    const nextIsArrayIndex = /^\d+$/.test(nextSegment);

    if (cursor[segment] === undefined || cursor[segment] === null) {
      cursor[segment] = nextIsArrayIndex ? [] : {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }

  const last = keyPath[keyPath.length - 1];
  cursor[last] = value;
}

function parseFlatKey(flatKey: string, separator: string): string[] {
  // Split by separator and then by bracket notation
  const parts: string[] = [];

  // First split by the separator
  const sepParts = flatKey.split(separator);

  for (const part of sepParts) {
    // Within each part, handle bracket notation like key[0][1]
    const bracketRe = /^([^\[]*)((?:\[\d+\])*)$/;
    const match = part.match(bracketRe);

    if (match) {
      if (match[1]) parts.push(match[1]);

      // Parse bracket indices
      const bracketStr = match[2];
      if (bracketStr) {
        const indices = bracketStr.match(/\[(\d+)\]/g) ?? [];
        for (const idx of indices) {
          parts.push(idx.replace(/\[|\]/g, ''));
        }
      }
    } else {
      parts.push(part);
    }
  }

  return parts.filter((p) => p !== '');
}

function unflattenObject(
  flat: Record<string, unknown>,
  separator: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [flatKey, value] of Object.entries(flat)) {
    const keyPath = parseFlatKey(flatKey, separator);
    if (keyPath.length === 0) continue;
    if (keyPath.length === 1) {
      result[keyPath[0]] = value;
    } else {
      setNestedValue(result, keyPath, value);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonFlattenProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder:
    '{"user":{"name":"John","address":{"city":"NY","zip":"10001"}},"tags":["developer","typescript"]}',
  autoProcess: true,

  exampleInput: JSON.stringify(
    {
      company: {
        name: 'Acme Corp',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          geo: {
            lat: 37.7749,
            lng: -122.4194,
          },
        },
        departments: [
          {
            name: 'Engineering',
            headcount: 42,
          },
          {
            name: 'Design',
            headcount: 10,
          },
        ],
      },
      meta: {
        version: '2.1.0',
        active: true,
      },
    },
    null,
    2,
  ),

  optionControls: [
    {
      key: 'mode',
      type: 'select',
      label: 'Mode',
      defaultValue: 'flatten',
      options: [
        { value: 'flatten', label: 'Flatten' },
        { value: 'unflatten', label: 'Unflatten' },
      ],
    },
    {
      key: 'separator',
      type: 'select',
      label: 'Separator',
      defaultValue: 'dot',
      options: [
        { value: 'dot', label: 'Dot  (a.b.c)' },
        { value: 'slash', label: 'Slash  (a/b/c)' },
        { value: 'underscore', label: 'Underscore  (a_b_c)' },
      ],
    },
    {
      key: 'flattenArrays',
      type: 'checkbox',
      label: 'Flatten arrays',
      defaultValue: true,
    },
    {
      key: 'indent',
      type: 'select',
      label: 'Output indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to flatten or unflatten.' };

    const separator = getSeparator(input.options);
    const flattenArrays = shouldFlattenArrays(input.options);
    const indent = getIndent(input.options);
    const mode = input.options?.mode === 'unflatten' ? 'unflatten' : 'flatten';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (mode === 'flatten') {
      if (typeof parsed !== 'object' || parsed === null) {
        return { error: 'Input must be a JSON object or array to flatten.' };
      }

      const depth = maxDepth(parsed);
      const flat = flattenObject(parsed, separator, flattenArrays);
      const flatKeys = Object.keys(flat);
      const originalKeys = typeof parsed === 'object' && !Array.isArray(parsed)
        ? Object.keys(parsed as Record<string, unknown>)
        : [];

      const output = JSON.stringify(flat, null, indent);

      return {
        output: {
          value: output,
          type: 'json',
          label: 'Flattened JSON',
          copyable: true,
          downloadFilename: 'flattened.json',
          downloadMime: 'application/json',
        },
        meta: {
          'original keys': originalKeys.length,
          'flat keys': flatKeys.length,
          'max depth': depth,
        },
      };
    } else {
      // unflatten
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { error: 'Input must be a flat JSON object to unflatten.' };
      }

      const flat = parsed as Record<string, unknown>;
      const unflat = unflattenObject(flat, separator);
      const output = JSON.stringify(unflat, null, indent);
      const depth = maxDepth(unflat);

      return {
        output: {
          value: output,
          type: 'json',
          label: 'Unflattened JSON',
          copyable: true,
          downloadFilename: 'unflattened.json',
          downloadMime: 'application/json',
        },
        meta: {
          'flat keys': Object.keys(flat).length,
          'restored keys': Object.keys(unflat).length,
          'max depth': depth,
        },
      };
    }
  },
};
