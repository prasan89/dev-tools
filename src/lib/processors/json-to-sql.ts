import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------

type SqlDialect = 'generic-sql' | 'mysql' | 'postgresql' | 'sqlite';

function inferSqlType(value: unknown, dialect: SqlDialect): string {
  if (value === null || value === undefined) return 'TEXT';
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite') return 'INTEGER'; // SQLite has no BOOLEAN
    return 'BOOLEAN';
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return 'INTEGER';
    if (dialect === 'postgresql') return 'NUMERIC(10,2)';
    return 'DECIMAL(10,2)';
  }
  if (typeof value === 'string') {
    if (dialect === 'postgresql') return 'VARCHAR(255)';
    if (dialect === 'sqlite') return 'TEXT';
    return 'VARCHAR(255)';
  }
  if (typeof value === 'object') {
    // Nested objects/arrays are serialized as JSON strings
    if (dialect === 'postgresql') return 'TEXT';
    return 'TEXT';
  }
  return 'TEXT';
}

function resolveColumnTypes(
  rows: Record<string, unknown>[],
  dialect: SqlDialect,
): Record<string, string> {
  const types: Record<string, string> = {};

  for (const row of rows) {
    for (const [col, val] of Object.entries(row)) {
      if (!(col in types) || types[col] === 'TEXT') {
        types[col] = inferSqlType(val, dialect);
      }
    }
  }

  return types;
}

// ---------------------------------------------------------------------------
// SQL quoting helpers
// ---------------------------------------------------------------------------

function quoteIdentifier(name: string, dialect: SqlDialect): string {
  if (dialect === 'mysql') return `\`${name.replace(/`/g, '``')}\``;
  // generic-sql, postgresql, sqlite all use double-quotes
  return `"${name.replace(/"/g, '""')}"`;
}

function quoteValue(value: unknown, dialect: SqlDialect): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite') return value ? '1' : '0';
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    // Serialize nested objects/arrays as escaped JSON strings
    return quoteValue(JSON.stringify(value), dialect);
  }
  // String — escape single quotes by doubling them
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

function buildCreateTable(
  tableName: string,
  columns: string[],
  types: Record<string, string>,
  dialect: SqlDialect,
  ifNotExists: boolean,
): string {
  const notExists = ifNotExists ? 'IF NOT EXISTS ' : '';
  const tbl = quoteIdentifier(tableName, dialect);
  const colDefs = columns.map((col) => {
    const colQ = quoteIdentifier(col, dialect);
    const colType = types[col] ?? 'TEXT';
    return `  ${colQ} ${colType}`;
  });

  let sql = `CREATE TABLE ${notExists}${tbl} (\n`;
  sql += colDefs.join(',\n');
  sql += '\n);';
  return sql;
}

function buildInserts(
  tableName: string,
  columns: string[],
  rows: Record<string, unknown>[],
  dialect: SqlDialect,
): string {
  const tbl = quoteIdentifier(tableName, dialect);
  const colList = columns.map((c) => quoteIdentifier(c, dialect)).join(', ');

  return rows
    .map((row) => {
      const vals = columns.map((col) => quoteValue(row[col] ?? null, dialect)).join(', ');
      return `INSERT INTO ${tbl} (${colList}) VALUES (${vals});`;
    })
    .join('\n');
}

function getDialect(options?: Record<string, unknown>): SqlDialect {
  const d = options?.dialect;
  if (d === 'mysql' || d === 'postgresql' || d === 'sqlite') return d;
  return 'generic-sql';
}

function getIncludeCreateTable(options?: Record<string, unknown>): boolean {
  return options?.includeCreateTable !== false;
}

function getIfNotExists(options?: Record<string, unknown>): boolean {
  return options?.ifNotExists !== false;
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

const TABLE_NAME = 'data';

const EXAMPLE_INPUT = JSON.stringify(
  [
    { id: 1, name: 'Alice', email: 'alice@example.com', age: 30, active: true, score: 9.5 },
    { id: 2, name: 'Bob', email: 'bob@example.com', age: 25, active: false, score: 7.8 },
    { id: 3, name: 'Carol', email: 'carol@example.com', age: 35, active: true, score: 8.2 },
  ],
  null,
  2,
);

export const jsonToSqlProcessor: ToolProcessor = {
  inputLabel: 'JSON Array Input',
  inputPlaceholder: '[{"id":1,"name":"Alice","age":30},{"id":2,"name":"Bob","age":25}]',
  autoProcess: false,
  exampleInput: EXAMPLE_INPUT,

  optionControls: [
    {
      key: 'dialect',
      type: 'select',
      label: 'SQL Dialect',
      defaultValue: 'generic-sql',
      options: [
        { value: 'generic-sql', label: 'Generic SQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'sqlite', label: 'SQLite' },
      ],
    },
    {
      key: 'includeCreateTable',
      type: 'checkbox',
      label: 'Include CREATE TABLE',
      defaultValue: true,
    },
    {
      key: 'ifNotExists',
      type: 'checkbox',
      label: 'IF NOT EXISTS',
      defaultValue: true,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JSON array of objects to convert.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    if (!Array.isArray(parsed)) {
      return { error: 'Input must be a JSON array (e.g. [{...},{...}]).' };
    }

    if (parsed.length === 0) {
      return { error: 'The JSON array is empty — nothing to convert.' };
    }

    // Validate all elements are objects
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        return { error: `Element at index ${i} is not an object. All array items must be plain objects.` };
      }
    }

    const rows = parsed as Record<string, unknown>[];
    const dialect = getDialect(input.options);
    const includeCreateTable = getIncludeCreateTable(input.options);
    const ifNotExists = getIfNotExists(input.options);

    // Collect all unique column names (preserving first-seen order)
    const columnSet = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        columnSet.add(key);
      }
    }
    const columns = Array.from(columnSet);

    if (columns.length === 0) {
      return { error: 'All objects in the array have no keys.' };
    }

    const types = resolveColumnTypes(rows, dialect);

    const parts: string[] = [];

    parts.push(`-- Generated by DevToolsHub. Review before executing.`);
    parts.push(`-- Table name: "${TABLE_NAME}" — replace with your actual table name.`);
    parts.push(`-- Dialect: ${dialect}`);
    parts.push('');

    if (includeCreateTable) {
      parts.push(buildCreateTable(TABLE_NAME, columns, types, dialect, ifNotExists));
      parts.push('');
    }

    parts.push(buildInserts(TABLE_NAME, columns, rows, dialect));

    const sql = parts.join('\n');

    return {
      output: {
        value: sql,
        type: 'text',
        label: `SQL INSERT statements (${rows.length} row${rows.length === 1 ? '' : 's'})`,
        copyable: true,
        downloadFilename: 'insert.sql',
        downloadMime: 'application/sql',
      },
      meta: {
        rows: rows.length,
        columns: columns.length,
        dialect,
      },
    };
  },
};
