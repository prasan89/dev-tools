import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Lazy-loaded: Ajv is only fetched on the JSON Schema Validator page.
// ajv@6 is already a transitive dependency — no extra bundle for other pages.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AjvInstance = any;

let _ajv: AjvInstance | null = null;

async function getAjv(): Promise<AjvInstance> {
  if (_ajv) return _ajv;
  // ajv v6: default export is a constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AjvConstructor = (await import('ajv') as any).default ?? (await import('ajv') as any);
  _ajv = new AjvConstructor({ allErrors: true, jsonPointers: true });
  return _ajv;
}

// Warm the Ajv instance immediately (fire-and-forget)
getAjv().catch(() => {});

function runSync(schema: unknown, data: unknown): { valid: boolean; errors: string[] } {
  if (!_ajv) throw new Error('__LOADING__');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let validate: any;
  try {
    validate = _ajv.compile(schema as object);
  } catch (err) {
    throw new Error(`Invalid schema: ${err instanceof Error ? err.message : String(err)}`);
  }

  const valid = validate(data) as boolean;
  if (valid) return { valid: true, errors: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = ((validate.errors ?? []) as any[]).map((e: any) => {
    const path = e.dataPath || '(root)';
    const msg = e.message ?? 'validation error';
    const params = e.params ? ` (${JSON.stringify(e.params)})` : '';
    return `${path}: ${msg}${params}`;
  });

  return { valid: false, errors };
}

export const jsonSchemaValidatorProcessor: ToolProcessor = {
  inputLabel: 'JSON Data',
  inputPlaceholder: 'Paste the JSON data to validate…',
  hasSecondaryInput: true,
  secondaryInputLabel: 'JSON Schema (draft-07)',
  autoProcess: false,
  exampleInput: `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com"
}`,
  exampleSecondary: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age"],
  "properties": {
    "name":  { "type": "string", "minLength": 1 },
    "age":   { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "format": "email" }
  },
  "additionalProperties": false
}`,

  process(input: ToolInput): ToolResult {
    const rawData   = input.value.trim();
    const rawSchema = (input.secondary ?? '').trim();

    if (!rawData)   return { error: 'Paste JSON data to validate.' };
    if (!rawSchema) return { error: 'Paste a JSON Schema in the second input.' };

    let data: unknown, schema: unknown;

    try { data = JSON.parse(rawData); } catch (err) {
      return { error: `Invalid JSON data:\n\n${err instanceof Error ? err.message : String(err)}` };
    }
    try { schema = JSON.parse(rawSchema); } catch (err) {
      return { error: `Invalid JSON Schema:\n\n${err instanceof Error ? err.message : String(err)}` };
    }

    let result: { valid: boolean; errors: string[] };
    try {
      result = runSync(schema, data);
    } catch (err) {
      if (err instanceof Error && err.message === '__LOADING__') {
        return { error: 'Validator is loading — click Run again.' };
      }
      return { error: err instanceof Error ? err.message : 'Validation error' };
    }

    if (result.valid) {
      return {
        output: {
          value: '✓ Valid\n\nThe JSON data is valid against the provided schema.',
          type: 'text',
          label: 'Validation Result',
          copyable: true,
        },
        meta: { valid: 'yes', errors: 0, draft: 'JSON Schema draft-07' },
      };
    }

    const lines = [
      `✗ Invalid — ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}\n`,
      ...result.errors.map((e, i) => `${i + 1}. ${e}`),
    ];

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: 'Validation Errors',
        copyable: true,
      },
      meta: { valid: 'no', errors: result.errors.length, draft: 'JSON Schema draft-07' },
    };
  },
};
