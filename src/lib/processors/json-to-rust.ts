import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------

type RustType =
  | 'String'
  | 'i64'
  | 'f64'
  | 'bool'
  | 'serde_json::Value'
  | string; // Vec<T> or nested struct name

function toSnakeCase(key: string): string {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function toPascalCase(key: string): string {
  const snake = toSnakeCase(key);
  return snake
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function sanitizeIdent(name: string): string {
  const s = toSnakeCase(name) || 'field';
  // Rust reserved keywords that need escaping via raw identifier
  const RESERVED = new Set([
    'as', 'break', 'const', 'continue', 'crate', 'else', 'enum', 'extern',
    'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod',
    'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct',
    'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
    'async', 'await', 'dyn', 'abstract', 'become', 'box', 'do', 'final',
    'macro', 'override', 'priv', 'typeof', 'unsized', 'virtual', 'yield', 'try',
  ]);
  if (RESERVED.has(s)) return `r#${s}`;
  // Must start with a letter or underscore
  if (/^[0-9]/.test(s)) return `field_${s}`;
  return s;
}

interface StructDef {
  name: string;
  fields: FieldDef[];
}

interface FieldDef {
  originalKey: string;
  snakeName: string;
  rustType: string;
  needsRename: boolean;
}

// Accumulates all struct definitions in dependency order (leaves first)
type StructMap = Map<string, StructDef>;

function inferRustType(
  value: unknown,
  keyHint: string,
  structs: StructMap,
  optionFields: boolean,
): string {
  if (value === null || value === undefined) {
    return optionFields ? 'Option<serde_json::Value>' : 'serde_json::Value';
  }

  if (typeof value === 'boolean') return 'bool';

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'i64' : 'f64';
  }

  if (typeof value === 'string') return 'String';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Vec<serde_json::Value>';
    // Infer element type from first element
    const elemType = inferRustType(value[0], keyHint + 'Item', structs, optionFields);
    return `Vec<${elemType}>`;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const structName = toPascalCase(keyHint) || 'NestedObject';
    buildStruct(structName, obj, structs, optionFields);
    return structName;
  }

  return 'serde_json::Value';
}

function buildStruct(
  name: string,
  obj: Record<string, unknown>,
  structs: StructMap,
  optionFields: boolean,
): void {
  // Avoid reprocessing
  if (structs.has(name)) return;

  const fields: FieldDef[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const snakeName = sanitizeIdent(key);
    const needsRename = snakeName !== key && snakeName.replace(/^r#/, '') !== key;

    let rustType = inferRustType(value, key, structs, optionFields);

    // Wrap nullable values in Option<T> when optionFields is true
    if (optionFields && value === null) {
      rustType = `Option<serde_json::Value>`;
    } else if (optionFields && value === undefined) {
      rustType = `Option<serde_json::Value>`;
    }

    fields.push({ originalKey: key, snakeName, rustType, needsRename });
  }

  structs.set(name, { name, fields });
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function getDerives(options?: Record<string, unknown>): string {
  const derives = options?.derives as string | undefined;
  if (derives === 'debug-clone-serde') {
    return 'Debug, Clone, Serialize, Deserialize';
  }
  // Default: Serialize + Deserialize
  return 'Serialize, Deserialize';
}

function renderStructs(structs: StructMap, derives: string): string {
  const lines: string[] = [];

  for (const struct of structs.values()) {
    lines.push(`#[derive(${derives})]`);
    lines.push(`pub struct ${struct.name} {`);
    for (const field of struct.fields) {
      if (field.needsRename) {
        lines.push(`    #[serde(rename = "${field.originalKey}")]`);
      }
      lines.push(`    pub ${field.snakeName}: ${field.rustType},`);
    }
    lines.push(`}`);
    lines.push('');
  }

  return lines.join('\n');
}

function generateRustCode(
  parsed: unknown,
  options: Record<string, unknown> | undefined,
): { code: string; rootType: string; properties: number; nestedTypes: number } {
  const derives = getDerives(options);
  const optionFields = options?.optionFields === true;

  const structs: StructMap = new Map();
  let rootType: string;
  let properties = 0;

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      buildStruct('Root', parsed[0] as Record<string, unknown>, structs, optionFields);
      rootType = 'array';
      properties = Object.keys(parsed[0] as Record<string, unknown>).length;
    } else {
      rootType = 'array';
      structs.set('Root', { name: 'Root', fields: [] });
      properties = 0;
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    buildStruct('Root', parsed as Record<string, unknown>, structs, optionFields);
    rootType = 'object';
    properties = Object.keys(parsed as Record<string, unknown>).length;
  } else {
    rootType = typeof parsed;
    structs.set('Root', { name: 'Root', fields: [] });
    properties = 0;
  }

  const nestedTypes = structs.size - 1;

  const lines: string[] = [];
  lines.push('// Generated by DevToolsHub — https://devtoolshub.dev');
  lines.push('');

  // Determine which serde imports are needed
  const derivesLower = derives.toLowerCase();
  const useSerde =
    derivesLower.includes('serialize') || derivesLower.includes('deserialize');
  if (useSerde) {
    lines.push('use serde::{Deserialize, Serialize};');
  }
  const usesValue = JSON.stringify(Array.from(structs.values())).includes('serde_json::Value');
  if (usesValue) {
    lines.push('use serde_json::Value;');
  }
  if (useSerde || usesValue) {
    lines.push('');
  }

  lines.push(renderStructs(structs, derives));

  return { code: lines.join('\n').trimEnd() + '\n', rootType, properties, nestedTypes };
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

const EXAMPLE_INPUT = JSON.stringify(
  {
    id: 42,
    username: 'alice_dev',
    isActive: true,
    score: 9.75,
    address: {
      city: 'Berlin',
      postalCode: '10115',
    },
    tags: ['rust', 'serde', 'backend'],
  },
  null,
  2,
);

export const jsonToRustProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"id":1,"name":"Alice","active":true}',
  autoProcess: false,
  exampleInput: EXAMPLE_INPUT,

  optionControls: [
    {
      key: 'derives',
      type: 'select',
      label: 'Derives',
      defaultValue: 'serde',
      options: [
        { value: 'serde', label: 'Serialize, Deserialize' },
        { value: 'debug-clone-serde', label: 'Debug, Clone, Serialize, Deserialize' },
      ],
    },
    {
      key: 'optionFields',
      type: 'checkbox',
      label: 'Wrap nullable fields in Option<T>',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON object or array to generate Rust structs.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return {
        error: 'Input must be a JSON object or array. Primitive values cannot be converted to Rust structs.',
      };
    }

    const { code, rootType, properties, nestedTypes } = generateRustCode(
      parsed,
      input.options,
    );

    return {
      output: {
        value: code,
        type: 'text',
        label: 'Rust Structs (serde)',
        copyable: true,
        downloadFilename: 'models.rs',
        downloadMime: 'text/plain',
      },
      meta: {
        'root type': rootType,
        properties,
        'nested types': nestedTypes,
      },
    };
  },
};
