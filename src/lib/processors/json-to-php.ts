import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PhpStyle = 'class' | 'array' | 'stdClass';

// ---------------------------------------------------------------------------
// PHP type inference
// ---------------------------------------------------------------------------

function inferPhpType(value: unknown): string {
  if (value === null) return 'mixed';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'float';
  }
  if (typeof value === 'string') return 'string';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'mixed';
}

function phpLiteral(value: unknown, indent: number): string {
  const pad = '    '.repeat(indent);
  const padClose = '    '.repeat(indent - 1);

  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // Escape backslashes and single quotes
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value
      .map((item) => `${pad}${phpLiteral(item, indent + 1)},`)
      .join('\n');
    return `[\n${items}\n${padClose}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return '[]';
    const items = keys
      .map((k) => {
        const escapedKey = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `${pad}'${escapedKey}' => ${phpLiteral(obj[k], indent + 1)},`;
      })
      .join('\n');
    return `[\n${items}\n${padClose}]`;
  }
  return 'null';
}

// ---------------------------------------------------------------------------
// PHP class generation (PHP 8 typed properties)
// ---------------------------------------------------------------------------

function sanitizeClassName(name: string): string {
  // PascalCase from camelCase/snake_case; strip non-identifier chars
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
    .replace(/^[0-9]/, (c) => '_' + c) || 'GeneratedClass';
}

function sanitizePropertyName(name: string): string {
  // camelCase property names; strip non-identifier chars
  const safe = name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
  if (!safe) return '_property';
  // camelCase: lower-case first letter, uppercase after underscores
  return safe
    .replace(/_+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toLowerCase());
}

interface ClassDef {
  name: string;
  properties: Array<{ phpName: string; phpType: string; defaultLiteral: string }>;
}

function collectClasses(
  obj: Record<string, unknown>,
  className: string,
  classes: ClassDef[],
): void {
  const properties: ClassDef['properties'] = [];

  for (const [key, value] of Object.entries(obj)) {
    const phpName = sanitizePropertyName(key);
    let phpType = inferPhpType(value);

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const nestedName = sanitizeClassName(key);
      phpType = nestedName;
      collectClasses(value as Record<string, unknown>, nestedName, classes);
    }

    const defaultLiteral =
      phpType === 'array' || phpType === 'object' || phpType === phpType[0].toUpperCase() + phpType.slice(1)
        ? phpLiteral(value, 2)
        : phpLiteral(value, 1);

    properties.push({ phpName, phpType, defaultLiteral });
  }

  classes.push({ name: className, properties });
}

function generateClassCode(classes: ClassDef[]): string {
  const lines: string[] = [];

  // Reverse so root class appears first, nested classes after
  const ordered = [...classes].reverse();

  for (const cls of ordered) {
    lines.push(`class ${cls.name}`);
    lines.push('{');
    for (const prop of cls.properties) {
      const typeHint =
        prop.phpType === 'mixed'
          ? 'mixed'
          : prop.phpType === 'object'
          ? 'mixed'
          : prop.phpType;
      lines.push(`    public ${typeHint} $${prop.phpName};`);
    }
    lines.push('');
    // Constructor
    const params = cls.properties
      .map((p) => {
        const typeHint =
          p.phpType === 'mixed' || p.phpType === 'object' ? 'mixed' : p.phpType;
        return `${typeHint} $${p.phpName}`;
      })
      .join(', ');
    lines.push(`    public function __construct(${params})`);
    lines.push('    {');
    for (const prop of cls.properties) {
      lines.push(`        $this->${prop.phpName} = $${prop.phpName};`);
    }
    lines.push('    }');
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// PHP array generation
// ---------------------------------------------------------------------------

function generateArrayCode(parsed: unknown): string {
  const literal = phpLiteral(parsed, 1);
  return `$data = ${literal};\n`;
}

// ---------------------------------------------------------------------------
// PHP stdClass / json_decode generation
// ---------------------------------------------------------------------------

function generateStdClassCode(raw: string): string {
  // Re-encode to compact form for embedding
  let compact: string;
  try {
    compact = JSON.stringify(JSON.parse(raw));
  } catch {
    compact = raw;
  }
  // Escape single quotes and backslashes for PHP string
  const escaped = compact.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `$data = json_decode('${escaped}');\n`;
}

// ---------------------------------------------------------------------------
// Options helpers
// ---------------------------------------------------------------------------

function getStyle(options?: Record<string, unknown>): PhpStyle {
  const s = options?.style;
  if (s === 'array' || s === 'stdClass') return s;
  return 'class';
}

// ---------------------------------------------------------------------------
// Metadata helpers
// ---------------------------------------------------------------------------

function countProperties(obj: Record<string, unknown>): number {
  return Object.keys(obj).length;
}

function countNestedTypes(obj: Record<string, unknown>): number {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      count += 1 + countNestedTypes(value as Record<string, unknown>);
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Example input
// ---------------------------------------------------------------------------

const EXAMPLE_INPUT = JSON.stringify(
  {
    name: 'Alice',
    age: 30,
    active: true,
    address: {
      street: '123 Main St',
      city: 'Springfield',
    },
    scores: [95, 87, 92],
  },
  null,
  2,
);

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

export const jsonToPhpProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"name":"Alice","age":30,"active":true,"address":{"city":"Springfield"},"scores":[95,87,92]}',
  autoProcess: false,
  exampleInput: EXAMPLE_INPUT,

  optionControls: [
    {
      key: 'style',
      type: 'select',
      label: 'Output Style',
      defaultValue: 'class',
      options: [
        { value: 'class', label: 'PHP 8 Class' },
        { value: 'array', label: 'PHP Array ($data = [...])' },
        { value: 'stdClass', label: 'stdClass (json_decode)' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to convert to PHP.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const style = getStyle(input.options);

    const header = [
      '<?php',
      '',
      '// Generated by DevToolsHub — https://devtoolshub.dev',
      '',
    ].join('\n');

    const rootType = Array.isArray(parsed) ? 'array' : typeof parsed === 'object' && parsed !== null ? 'object' : 'scalar';

    // ----- class style -----
    if (style === 'class') {
      if (rootType !== 'object') {
        return {
          error: 'Class generation requires a JSON object at the root. Use "PHP Array" style for arrays.',
        };
      }

      const rootObj = parsed as Record<string, unknown>;
      const classes: ClassDef[] = [];
      collectClasses(rootObj, 'GeneratedModel', classes);

      const classCode = generateClassCode(classes);

      const phpCode = header + classCode;

      const nestedTypes = countNestedTypes(rootObj);

      return {
        output: {
          value: phpCode,
          type: 'text',
          label: 'PHP 8 Class',
          copyable: true,
          downloadFilename: 'models.php',
          downloadMime: 'application/x-httpd-php',
        },
        meta: {
          'root type': rootType,
          'properties found': countProperties(rootObj),
          'nested types': nestedTypes,
        },
      };
    }

    // ----- array style -----
    if (style === 'array') {
      const arrayCode = generateArrayCode(parsed);
      const phpCode = header + arrayCode;

      const propertiesFound =
        rootType === 'object'
          ? countProperties(parsed as Record<string, unknown>)
          : Array.isArray(parsed)
          ? parsed.length
          : 0;

      return {
        output: {
          value: phpCode,
          type: 'text',
          label: 'PHP Array',
          copyable: true,
          downloadFilename: 'models.php',
          downloadMime: 'application/x-httpd-php',
        },
        meta: {
          'root type': rootType,
          'properties found': propertiesFound,
          'nested types':
            rootType === 'object'
              ? countNestedTypes(parsed as Record<string, unknown>)
              : 0,
        },
      };
    }

    // ----- stdClass style -----
    const stdCode = generateStdClassCode(raw);
    const phpCode = header + stdCode;

    const propertiesFound =
      rootType === 'object'
        ? countProperties(parsed as Record<string, unknown>)
        : Array.isArray(parsed)
        ? parsed.length
        : 0;

    return {
      output: {
        value: phpCode,
        type: 'text',
        label: 'PHP stdClass (json_decode)',
        copyable: true,
        downloadFilename: 'models.php',
        downloadMime: 'application/x-httpd-php',
      },
      meta: {
        'root type': rootType,
        'properties found': propertiesFound,
        'nested types':
          rootType === 'object'
            ? countNestedTypes(parsed as Record<string, unknown>)
            : 0,
      },
    };
  },
};
