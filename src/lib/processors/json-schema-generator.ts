import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Schema type definitions
// ---------------------------------------------------------------------------

type JsonSchemaNode =
  | { type: 'string'; examples?: unknown[] }
  | { type: 'integer'; examples?: unknown[] }
  | { type: 'number'; examples?: unknown[] }
  | { type: 'boolean'; examples?: unknown[] }
  | { type: 'null' }
  | {
      type: 'array';
      items?: JsonSchemaNode;
      examples?: unknown[];
    }
  | {
      type: 'object';
      properties: Record<string, JsonSchemaNode>;
      required?: string[];
      examples?: unknown[];
    };

interface RootSchema {
  $schema?: string;
  type: 'object';
  properties: Record<string, JsonSchemaNode>;
  required?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isInteger(n: number): boolean {
  return Number.isFinite(n) && Math.floor(n) === n;
}

/** Return max nesting depth of an already-built schema node */
function schemaDepth(node: JsonSchemaNode, current = 1): number {
  if (node.type === 'object') {
    const childDepths = Object.values(node.properties).map((child) =>
      schemaDepth(child, current + 1)
    );
    return childDepths.length > 0 ? Math.max(...childDepths) : current;
  }
  if (node.type === 'array' && node.items) {
    return schemaDepth(node.items, current + 1);
  }
  return current;
}

/** Count total leaf/property nodes in a schema tree */
function countProperties(node: JsonSchemaNode): number {
  if (node.type === 'object') {
    const children = Object.values(node.properties);
    return children.length + children.reduce((sum, c) => sum + countProperties(c), 0);
  }
  if (node.type === 'array' && node.items) {
    return countProperties(node.items);
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Core inference
// ---------------------------------------------------------------------------

function inferSchema(
  value: unknown,
  includeExamples: boolean,
  markAllRequired: boolean
): JsonSchemaNode {
  if (value === null) {
    return { type: 'null' };
  }

  if (typeof value === 'boolean') {
    const node: Extract<JsonSchemaNode, { type: 'boolean' }> = { type: 'boolean' };
    if (includeExamples) node.examples = [value];
    return node;
  }

  if (typeof value === 'number') {
    if (isInteger(value)) {
      const node: Extract<JsonSchemaNode, { type: 'integer' }> = { type: 'integer' };
      if (includeExamples) node.examples = [value];
      return node;
    }
    const node: Extract<JsonSchemaNode, { type: 'number' }> = { type: 'number' };
    if (includeExamples) node.examples = [value];
    return node;
  }

  if (typeof value === 'string') {
    const node: Extract<JsonSchemaNode, { type: 'string' }> = { type: 'string' };
    if (includeExamples) node.examples = [value];
    return node;
  }

  if (Array.isArray(value)) {
    const node: Extract<JsonSchemaNode, { type: 'array' }> = { type: 'array' };
    if (value.length > 0) {
      node.items = inferSchema(value[0], includeExamples, markAllRequired);
    }
    if (includeExamples) node.examples = [value];
    return node;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    const properties: Record<string, JsonSchemaNode> = {};
    for (const key of keys) {
      properties[key] = inferSchema(obj[key], includeExamples, markAllRequired);
    }
    const node: Extract<JsonSchemaNode, { type: 'object' }> = {
      type: 'object',
      properties,
    };
    if (markAllRequired && keys.length > 0) {
      node.required = keys;
    }
    if (includeExamples) node.examples = [value];
    return node;
  }

  // Fallback (e.g. undefined, functions — shouldn't appear in valid JSON)
  const node: Extract<JsonSchemaNode, { type: 'string' }> = { type: 'string' };
  return node;
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonSchemaGeneratorProcessor: ToolProcessor = {
  inputLabel: 'JSON Example',
  inputPlaceholder: 'Paste a JSON object to generate its schema…',
  autoProcess: true,

  exampleInput: JSON.stringify(
    {
      id: 42,
      name: 'Alice',
      active: true,
      score: 9.5,
      address: {
        street: '123 Main St',
        city: 'Springfield',
      },
      tags: ['admin', 'editor'],
    },
    null,
    2
  ),

  optionControls: [
    {
      key: 'markAllRequired',
      type: 'checkbox',
      label: 'Mark all properties as required',
      defaultValue: true,
    },
    {
      key: 'includeExamples',
      type: 'checkbox',
      label: 'Include "examples" for each property',
      defaultValue: false,
    },
    {
      key: 'draft',
      type: 'select',
      label: 'Schema draft',
      defaultValue: 'draft-07',
      options: [
        { value: 'draft-07', label: 'Draft-07' },
        { value: 'draft-2020-12', label: 'Draft 2020-12' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON example to generate its schema.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: 'Input must be a JSON object (not an array or primitive).' };
    }

    const markAllRequired = input.options?.['markAllRequired'] !== false;
    const includeExamples = input.options?.['includeExamples'] === true;
    const draft = String(input.options?.['draft'] ?? 'draft-07');

    const schemaUrl =
      draft === 'draft-2020-12'
        ? 'https://json-schema.org/draft/2020-12/schema'
        : 'http://json-schema.org/draft-07/schema#';

    const inferredNode = inferSchema(parsed, includeExamples, markAllRequired);

    // inferredNode must be object since we checked above
    const objectNode = inferredNode as Extract<JsonSchemaNode, { type: 'object' }>;

    const schema: RootSchema = {
      $schema: schemaUrl,
      ...objectNode,
    };

    const output = JSON.stringify(schema, null, 2);

    const topLevelKeys = Object.keys((parsed as Record<string, unknown>));
    const propCount = topLevelKeys.length + countProperties(objectNode);
    const depth = schemaDepth(objectNode);
    const requiredCount = markAllRequired ? topLevelKeys.length : 0;

    return {
      output: {
        value: output,
        type: 'json',
        label: `JSON Schema (${draft})`,
        copyable: true,
        downloadFilename: 'schema.json',
        downloadMime: 'application/json',
      },
      meta: {
        'properties found': propCount,
        'required fields': requiredCount,
        'max depth': depth,
      },
    };
  },
};
