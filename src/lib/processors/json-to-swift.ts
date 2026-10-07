import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwiftProperty {
  swiftName: string;
  jsonKey: string;
  swiftType: string;
  needsCodingKey: boolean;
}

interface StructDef {
  name: string;
  properties: SwiftProperty[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a JSON key to Swift camelCase. */
function toCamelCase(key: string): string {
  // Handle snake_case, kebab-case, space-separated
  return key
    .replace(/[-_\s]+(.)/g, (_, ch: string) => ch.toUpperCase())
    .replace(/^(.)/, (_, ch: string) => ch.toLowerCase());
}

/** Return true when the camelCase name differs from the original JSON key. */
function needsCodingKey(jsonKey: string, swiftName: string): boolean {
  return jsonKey !== swiftName;
}

/** Sanitize a name so it is a valid Swift identifier. */
function sanitizeIdentifier(name: string): string {
  // Replace any remaining non-alphanumeric, non-underscore chars
  let safe = name.replace(/[^a-zA-Z0-9_]/g, '_');
  // Must start with a letter or underscore
  if (/^[0-9]/.test(safe)) {
    safe = '_' + safe;
  }
  return safe || '_unknown';
}

/**
 * Derive a PascalCase struct name from a JSON key.
 * e.g. "user_profile" -> "UserProfile"
 */
function toStructName(key: string): string {
  const camel = toCamelCase(key);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------

/**
 * Infer the Swift type for a JSON value.
 * Recursively collects nested struct definitions into `structs`.
 */
function inferSwiftType(
  value: unknown,
  keyHint: string,
  structs: Map<string, StructDef>,
  optional: boolean,
): string {
  const optSuffix = optional ? '?' : '';

  if (value === null || value === undefined) {
    // Null is always Optional Any
    return '[String: Any]?';
  }

  if (typeof value === 'string') return `String${optSuffix}`;
  if (typeof value === 'boolean') return `Bool${optSuffix}`;
  if (typeof value === 'number') {
    return Number.isInteger(value) ? `Int${optSuffix}` : `Double${optSuffix}`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return `[Any]${optSuffix}`;
    const elementType = inferSwiftType(value[0], keyHint, structs, false);
    return `[${elementType}]${optSuffix}`;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) return `[String: Any]${optSuffix}`;

    // Generate a named struct
    const structName = sanitizeIdentifier(toStructName(keyHint));
    if (!structs.has(structName)) {
      // Reserve the name first to avoid infinite recursion on self-referential keys
      structs.set(structName, { name: structName, properties: [] });
      const props = buildProperties(obj, structs, optional);
      structs.set(structName, { name: structName, properties: props });
    }
    return `${structName}${optSuffix}`;
  }

  return `Any${optSuffix}`;
}

function buildProperties(
  obj: Record<string, unknown>,
  structs: Map<string, StructDef>,
  optional: boolean,
): SwiftProperty[] {
  return Object.entries(obj).map(([jsonKey, value]) => {
    const swiftRaw = toCamelCase(jsonKey);
    const swiftName = sanitizeIdentifier(swiftRaw);
    const swiftType = inferSwiftType(value, jsonKey, structs, optional);
    return {
      swiftName,
      jsonKey,
      swiftType,
      needsCodingKey: needsCodingKey(jsonKey, swiftName),
    };
  });
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function renderStruct(def: StructDef, addCodingKeys: boolean): string {
  const lines: string[] = [];

  lines.push(`struct ${def.name}: Codable {`);

  for (const prop of def.properties) {
    lines.push(`    var ${prop.swiftName}: ${prop.swiftType}`);
  }

  const needsKeys = addCodingKeys && def.properties.some((p) => p.needsCodingKey);
  if (needsKeys) {
    lines.push('');
    lines.push('    enum CodingKeys: String, CodingKey {');
    for (const prop of def.properties) {
      if (prop.needsCodingKey) {
        lines.push(`        case ${prop.swiftName} = "${prop.jsonKey}"`);
      } else {
        lines.push(`        case ${prop.swiftName}`);
      }
    }
    lines.push('    }');
  }

  lines.push('}');
  return lines.join('\n');
}

function generateSwift(
  parsed: unknown,
  addCodingKeys: boolean,
  optionalFields: boolean,
): { code: string; rootType: string; propertyCount: number; nestedTypeCount: number } {
  const structs = new Map<string, StructDef>();

  let rootType: string;
  let rootStructName = 'RootObject';
  let propertyCount = 0;

  if (Array.isArray(parsed)) {
    rootType = 'array';
    const element = parsed.length > 0 ? parsed[0] : null;
    if (element !== null && typeof element === 'object' && !Array.isArray(element)) {
      const obj = element as Record<string, unknown>;
      structs.set(rootStructName, {
        name: rootStructName,
        properties: buildProperties(obj, structs, optionalFields),
      });
      propertyCount = Object.keys(obj).length;
    }
  } else if (parsed !== null && typeof parsed === 'object') {
    rootType = 'object';
    const obj = parsed as Record<string, unknown>;
    structs.set(rootStructName, {
      name: rootStructName,
      properties: buildProperties(obj, structs, optionalFields),
    });
    propertyCount = Object.keys(obj).length;
  } else {
    rootType = typeof parsed as string;
    // Scalar at root — wrap it
    structs.set(rootStructName, {
      name: rootStructName,
      properties: [
        {
          swiftName: 'value',
          jsonKey: 'value',
          swiftType: inferSwiftType(parsed, 'value', structs, optionalFields),
          needsCodingKey: false,
        },
      ],
    });
    propertyCount = 1;
  }

  const lines: string[] = [
    '// Generated by DevToolsHub — https://devtoolshub.dev',
    '// Review and adapt this file to your project before use.',
    '',
    'import Foundation',
    '',
  ];

  // Emit nested structs first (depth-first order they were added), root last
  const structNames = Array.from(structs.keys());
  const nonRoot = structNames.filter((n) => n !== rootStructName);
  const ordered = [...nonRoot, rootStructName];

  for (const name of ordered) {
    const def = structs.get(name);
    if (def) {
      lines.push(renderStruct(def, addCodingKeys));
      lines.push('');
    }
  }

  const code = lines.join('\n').trimEnd() + '\n';
  const nestedTypeCount = nonRoot.length;

  return { code, rootType, propertyCount, nestedTypeCount };
}

// ---------------------------------------------------------------------------
// Options helpers
// ---------------------------------------------------------------------------

function getAddCodingKeys(options?: Record<string, unknown>): boolean {
  return options?.codingKeys !== false;
}

function getOptionalFields(options?: Record<string, unknown>): boolean {
  return options?.optionalFields !== false;
}

// ---------------------------------------------------------------------------
// Example input
// ---------------------------------------------------------------------------

const EXAMPLE_INPUT = JSON.stringify(
  {
    user_id: 42,
    full_name: 'Ada Lovelace',
    is_active: true,
    score: 98.6,
    address: {
      street: '123 Main St',
      city: 'London',
      zip_code: 'EC1A 1BB',
    },
    tags: ['engineer', 'pioneer'],
  },
  null,
  2,
);

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonToSwiftProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder:
    '{"user_id":42,"full_name":"Ada Lovelace","is_active":true,"score":98.6,"address":{"street":"123 Main St","city":"London"},"tags":["engineer"]}',
  autoProcess: false,
  exampleInput: EXAMPLE_INPUT,

  optionControls: [
    {
      key: 'codingKeys',
      type: 'checkbox',
      label: 'Add CodingKeys enum (for non-camelCase JSON keys)',
      defaultValue: true,
    },
    {
      key: 'optionalFields',
      type: 'checkbox',
      label: 'Mark fields as Optional (?)',
      defaultValue: true,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON object or array to generate Swift structs.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const addCodingKeys = getAddCodingKeys(input.options);
    const optionalFields = getOptionalFields(input.options);

    const { code, rootType, propertyCount, nestedTypeCount } = generateSwift(
      parsed,
      addCodingKeys,
      optionalFields,
    );

    return {
      output: {
        value: code,
        type: 'text',
        label: 'Swift Codable Structs',
        copyable: true,
        downloadFilename: 'models.swift',
        downloadMime: 'text/plain',
      },
      meta: {
        'root type': rootType,
        'properties found': propertyCount,
        'nested types': nestedTypeCount,
      },
    };
  },
};
