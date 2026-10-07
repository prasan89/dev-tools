/**
 * M13 tests — 19 new JSON tool processors + registry/index coverage
 *
 * Covers:
 *   json-repair, json-flatten, json-size-analyzer, json-search,
 *   json-stringify, json-token-counter, jsonc-to-json, json-to-sql,
 *   json-to-markdown, json-schema-generator, json-table-viewer,
 *   json-to-typescript, json-to-python, json-to-csharp, json-to-go,
 *   json-to-kotlin, json-to-swift, json-to-rust, json-to-php
 */

import { jsonRepairProcessor } from '@/lib/processors/json-repair';
import { jsonFlattenProcessor } from '@/lib/processors/json-flatten';
import { jsonSizeAnalyzerProcessor } from '@/lib/processors/json-size-analyzer';
import { jsonSearchProcessor } from '@/lib/processors/json-search';
import { jsonStringifyProcessor } from '@/lib/processors/json-stringify';
import { jsonTokenCounterProcessor } from '@/lib/processors/json-token-counter';
import { jsoncToJsonProcessor } from '@/lib/processors/jsonc-to-json';
import { jsonToSqlProcessor } from '@/lib/processors/json-to-sql';
import { jsonToMarkdownProcessor } from '@/lib/processors/json-to-markdown';
import { jsonSchemaGeneratorProcessor } from '@/lib/processors/json-schema-generator';
import { jsonTableViewerProcessor } from '@/lib/processors/json-table-viewer';
import { jsonToTypescriptProcessor } from '@/lib/processors/json-to-typescript';
import { jsonToPythonProcessor } from '@/lib/processors/json-to-python';
import { jsonToCsharpProcessor } from '@/lib/processors/json-to-csharp';
import { jsonToGoProcessor } from '@/lib/processors/json-to-go';
import { jsonToKotlinProcessor } from '@/lib/processors/json-to-kotlin';
import { jsonToSwiftProcessor } from '@/lib/processors/json-to-swift';
import { jsonToRustProcessor } from '@/lib/processors/json-to-rust';
import { jsonToPhpProcessor } from '@/lib/processors/json-to-php';

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

type AnyProcessor = typeof jsonRepairProcessor;

function run(
  proc: AnyProcessor,
  value: string,
  opts?: Record<string, unknown>,
  secondary?: string,
) {
  return proc.process({ value, secondary, options: opts });
}

// ---------------------------------------------------------------------------
// JSON Repair
// ---------------------------------------------------------------------------

describe('json-repair', () => {
  it('returns error on empty input', () => {
    expect(run(jsonRepairProcessor, '').error).toBeTruthy();
  });

  it('repairs trailing commas', () => {
    const r = run(jsonRepairProcessor, '{"a":1,"b":2,}');
    expect(r.error).toBeFalsy();
    expect(r.output?.value).toBeTruthy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a).toBe(1);
    expect(parsed.b).toBe(2);
  });

  it('repairs single-quoted strings', () => {
    const r = run(jsonRepairProcessor, "{'name':'Alice'}");
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.name).toBe('Alice');
  });

  it('repairs unquoted keys', () => {
    const r = run(jsonRepairProcessor, '{name:"Alice"}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.name).toBe('Alice');
  });

  it('repairs NaN to null', () => {
    const r = run(jsonRepairProcessor, '{"x":NaN}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.x).toBeNull();
  });

  it('removes single-line comments', () => {
    const r = run(jsonRepairProcessor, '{"a":1 // comment\n}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a).toBe(1);
  });

  it('removes block comments', () => {
    const r = run(jsonRepairProcessor, '{"a":1 /* block */}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a).toBe(1);
  });

  it('replaces hex literals with decimals', () => {
    const r = run(jsonRepairProcessor, '{"val":0xFF}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.val).toBe(255);
  });

  it('returns output copyable and downloadable for valid repair', () => {
    const r = run(jsonRepairProcessor, '{"a":1,}');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('repaired.json');
  });

  it('returns was_valid yes for already-valid JSON', () => {
    const r = run(jsonRepairProcessor, '{"a":1}');
    expect(r.meta?.['was_valid']).toBe('yes');
  });

  it('returns repairs_made > 0 for repaired JSON', () => {
    const r = run(jsonRepairProcessor, '{"a":1,}');
    expect(Number(r.meta?.['repairs_made'])).toBeGreaterThan(0);
  });

  it('autoProcess is true', () => {
    expect(jsonRepairProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON Flatten
// ---------------------------------------------------------------------------

describe('json-flatten', () => {
  it('returns error on empty input', () => {
    expect(run(jsonFlattenProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonFlattenProcessor, '{bad}').error).toBeTruthy();
  });

  it('produces dot-notation keys', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":1}}', { mode: 'flatten' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed['a.b']).toBe(1);
  });

  it('flattens nested objects', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":{"c":3}}}', { mode: 'flatten' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed['a.b.c']).toBe(3);
  });

  it('flattens arrays by default', () => {
    const r = run(jsonFlattenProcessor, '{"tags":["a","b"]}', { mode: 'flatten' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed['tags[0]']).toBe('a');
  });

  it('preserves arrays when flattenArrays is false', () => {
    const r = run(jsonFlattenProcessor, '{"tags":["a","b"]}', { mode: 'flatten', flattenArrays: false });
    const parsed = JSON.parse(r.output!.value);
    expect(Array.isArray(parsed.tags)).toBe(true);
  });

  it('uses slash separator when option is set', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":1}}', { mode: 'flatten', separator: 'slash' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed['a/b']).toBe(1);
  });

  it('uses underscore separator', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":1}}', { mode: 'flatten', separator: 'underscore' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed['a_b']).toBe(1);
  });

  it('unflatten mode restores nested structure', () => {
    const r = run(jsonFlattenProcessor, '{"a.b":1,"a.c":2}', { mode: 'unflatten' });
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a.b).toBe(1);
    expect(parsed.a.c).toBe(2);
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":1}}', { mode: 'flatten' });
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('flattened.json');
  });

  it('returns meta with flat keys count', () => {
    const r = run(jsonFlattenProcessor, '{"a":{"b":1},"c":2}', { mode: 'flatten' });
    expect(Number(r.meta?.['flat keys'])).toBeGreaterThan(0);
  });

  it('autoProcess is true', () => {
    expect(jsonFlattenProcessor.autoProcess).toBe(true);
  });

  it('has mode select control', () => {
    const ctrl = jsonFlattenProcessor.optionControls?.find(c => c.key === 'mode');
    expect(ctrl?.type).toBe('select');
  });
});

// ---------------------------------------------------------------------------
// JSON Size Analyzer
// ---------------------------------------------------------------------------

describe('json-size-analyzer', () => {
  it('returns error on empty input', () => {
    expect(run(jsonSizeAnalyzerProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonSizeAnalyzerProcessor, '{bad}').error).toBeTruthy();
  });

  it('produces a size report for a simple object', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"name":"Alice","age":30}');
    expect(r.output?.value).toContain('=== JSON Size Analysis ===');
    expect(r.output?.value).toContain('Total keys:');
  });

  it('reports total keys count in meta', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"a":1,"b":2,"c":3}');
    expect(Number(r.meta?.['keys'])).toBe(3);
  });

  it('reports depth in meta', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"a":{"b":{"c":1}}}');
    expect(Number(r.meta?.['depth'])).toBeGreaterThanOrEqual(2);
  });

  it('reports byte count in meta', () => {
    const input = '{"a":1}';
    const r = run(jsonSizeAnalyzerProcessor, input);
    expect(Number(r.meta?.['bytes'])).toBe(Buffer.byteLength(input, 'utf8'));
  });

  it('reports objects and arrays counts', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"user":{"name":"Bob"},"scores":[1,2,3]}');
    expect(Number(r.meta?.['objects'])).toBeGreaterThan(0);
    expect(Number(r.meta?.['arrays'])).toBeGreaterThan(0);
  });

  it('output is copyable', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"a":1}');
    expect(r.output?.copyable).toBe(true);
  });

  it('handles unicode strings', () => {
    const r = run(jsonSizeAnalyzerProcessor, '{"name":"日本語"}');
    expect(r.output?.value).toBeTruthy();
    expect(r.error).toBeFalsy();
  });

  it('autoProcess is true', () => {
    expect(jsonSizeAnalyzerProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON Search
// ---------------------------------------------------------------------------

describe('json-search', () => {
  const DATA = '{"name":"Alice","email":"alice@example.com","age":30}';

  it('returns error on empty JSON input', () => {
    expect(run(jsonSearchProcessor, '', {}, 'alice').error).toBeTruthy();
  });

  it('returns error when query is empty', () => {
    expect(run(jsonSearchProcessor, DATA, {}, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonSearchProcessor, '{bad}', {}, 'query').error).toBeTruthy();
  });

  it('finds a matching value', () => {
    const r = run(jsonSearchProcessor, DATA, { matchType: 'contains' }, 'alice');
    expect(r.output?.value).toContain('alice');
  });

  it('finds a matching key', () => {
    const r = run(jsonSearchProcessor, DATA, { searchIn: 'keys only' }, 'email');
    expect(r.output?.value).toContain('email');
  });

  it('exact match finds the right entry', () => {
    const r = run(jsonSearchProcessor, DATA, { matchType: 'exact' }, 'Alice');
    expect(r.meta?.['total matches']).toBeGreaterThan(0);
  });

  it('regex match works', () => {
    const r = run(jsonSearchProcessor, DATA, { matchType: 'regex' }, '^Alice$');
    expect(r.meta?.['total matches']).toBeGreaterThan(0);
  });

  it('returns error for invalid regex', () => {
    const r = run(jsonSearchProcessor, DATA, { matchType: 'regex' }, '[invalid');
    expect(r.error).toBeTruthy();
  });

  it('returns no-match message when query not found', () => {
    const r = run(jsonSearchProcessor, DATA, { matchType: 'exact' }, 'zzznomatch');
    expect(r.output?.value).toContain('No matches found');
    expect(r.meta?.['total matches']).toBe(0);
  });

  it('hasSecondaryInput is true', () => {
    expect(jsonSearchProcessor.hasSecondaryInput).toBe(true);
  });

  it('case insensitive search works', () => {
    const r = run(jsonSearchProcessor, DATA, { caseSensitive: false }, 'ALICE');
    expect(r.meta?.['total matches']).toBeGreaterThan(0);
  });

  it('autoProcess is false', () => {
    expect(jsonSearchProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON Stringify
// ---------------------------------------------------------------------------

describe('json-stringify', () => {
  it('returns error on empty input', () => {
    expect(run(jsonStringifyProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonStringifyProcessor, '{bad}').error).toBeTruthy();
  });

  it('produces JavaScript JSON.parse string by default', () => {
    const r = run(jsonStringifyProcessor, '{"name":"Alice"}', { language: 'javascript' });
    expect(r.output?.value).toContain('JSON.parse(');
  });

  it('produces Python json.loads string', () => {
    const r = run(jsonStringifyProcessor, '{"a":1}', { language: 'python' });
    expect(r.output?.value).toContain('json.loads(');
  });

  it('produces Go byte literal', () => {
    const r = run(jsonStringifyProcessor, '{"a":1}', { language: 'go' });
    expect(r.output?.value).toContain('data :=');
  });

  it('produces Java string literal', () => {
    const r = run(jsonStringifyProcessor, '{"a":1}', { language: 'java' });
    expect(r.output?.value).toContain('String json =');
  });

  it('escapes unicode when option is set', () => {
    const r = run(jsonStringifyProcessor, '{"emoji":"日本"}', { language: 'javascript', escapeUnicode: true });
    expect(r.output?.value).toContain('\\u');
  });

  it('minify option minifies the JSON', () => {
    const r = run(jsonStringifyProcessor, '{"a":1,"b":2}', { minify: true, language: 'javascript' });
    expect(r.meta?.['minified']).toBe('yes');
  });

  it('output is copyable', () => {
    const r = run(jsonStringifyProcessor, '{"a":1}');
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is true', () => {
    expect(jsonStringifyProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON Token Counter
// ---------------------------------------------------------------------------

describe('json-token-counter', () => {
  it('returns error on empty input', () => {
    expect(run(jsonTokenCounterProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonTokenCounterProcessor, '{bad}').error).toBeTruthy();
  });

  it('produces a token count report', () => {
    const r = run(jsonTokenCounterProcessor, '{"name":"Alice","age":30}');
    expect(r.output?.value).toContain('=== Token Count Estimates ===');
  });

  it('reports chars/4 estimate', () => {
    const r = run(jsonTokenCounterProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('Estimate (chars');
  });

  it('model gpt4 option shows GPT-4 text', () => {
    const r = run(jsonTokenCounterProcessor, '{"a":1}', { model: 'gpt4' });
    expect(r.output?.value).toContain('GPT-4');
  });

  it('model claude option shows Claude text', () => {
    const r = run(jsonTokenCounterProcessor, '{"a":1}', { model: 'claude' });
    expect(r.output?.value).toContain('Claude');
  });

  it('returns characters in meta', () => {
    const input = '{"a":1}';
    const r = run(jsonTokenCounterProcessor, input);
    expect(r.meta?.['characters']).toBe(input.length);
  });

  it('output is copyable', () => {
    const r = run(jsonTokenCounterProcessor, '{"a":1}');
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is true', () => {
    expect(jsonTokenCounterProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSONC to JSON
// ---------------------------------------------------------------------------

describe('jsonc-to-json', () => {
  it('returns error on empty input', () => {
    expect(run(jsoncToJsonProcessor, '').error).toBeTruthy();
  });

  it('strips single-line comments', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1 // comment\n}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a).toBe(1);
  });

  it('strips block comments', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1 /* block comment */}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.a).toBe(1);
  });

  it('removes trailing commas', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1,"b":2,}');
    expect(r.error).toBeFalsy();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.b).toBe(2);
  });

  it('counts removed comments in meta', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1 // c1\n,"b":2 // c2\n}');
    expect(Number(r.meta?.['comments removed'])).toBe(2);
  });

  it('counts removed trailing commas in meta', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1,}');
    expect(Number(r.meta?.['trailing commas removed'])).toBe(1);
  });

  it('prettify option produces indented output', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1}', { prettify: true, indent: '2' });
    expect(r.output?.value).toContain('\n');
  });

  it('prettify false produces compact output', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1,"b":2}', { prettify: false });
    expect(r.output?.value).not.toContain('\n');
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsoncToJsonProcessor, '{"a":1}');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('converted.json');
  });

  it('autoProcess is true', () => {
    expect(jsoncToJsonProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON to SQL
// ---------------------------------------------------------------------------

describe('json-to-sql', () => {
  const SIMPLE = '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]';

  it('returns error on empty input', () => {
    expect(run(jsonToSqlProcessor, '').error).toBeTruthy();
  });

  it('returns error on non-array input', () => {
    expect(run(jsonToSqlProcessor, '{"a":1}').error).toBeTruthy();
  });

  it('returns error on empty array', () => {
    expect(run(jsonToSqlProcessor, '[]').error).toBeTruthy();
  });

  it('produces INSERT statements', () => {
    const r = run(jsonToSqlProcessor, SIMPLE);
    expect(r.output?.value).toContain('INSERT INTO');
  });

  it('produces CREATE TABLE by default', () => {
    const r = run(jsonToSqlProcessor, SIMPLE, { includeCreateTable: true });
    expect(r.output?.value).toContain('CREATE TABLE');
  });

  it('omits CREATE TABLE when option is false', () => {
    const r = run(jsonToSqlProcessor, SIMPLE, { includeCreateTable: false });
    expect(r.output?.value).not.toContain('CREATE TABLE');
  });

  it('uses MySQL backtick quoting', () => {
    const r = run(jsonToSqlProcessor, SIMPLE, { dialect: 'mysql' });
    expect(r.output?.value).toContain('`');
  });

  it('uses PostgreSQL dialect', () => {
    const r = run(jsonToSqlProcessor, SIMPLE, { dialect: 'postgresql' });
    expect(r.output?.value).toContain('postgresql');
  });

  it('reports rows count in meta', () => {
    const r = run(jsonToSqlProcessor, SIMPLE);
    expect(r.meta?.['rows']).toBe(2);
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonToSqlProcessor, SIMPLE);
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('insert.sql');
  });

  it('autoProcess is false', () => {
    expect(jsonToSqlProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Markdown
// ---------------------------------------------------------------------------

describe('json-to-markdown', () => {
  const ARRAY = '[{"name":"Alice","age":28},{"name":"Bob","age":35}]';

  it('returns error on empty input', () => {
    expect(run(jsonToMarkdownProcessor, '').error).toBeTruthy();
  });

  it('produces markdown table for array of objects', () => {
    const r = run(jsonToMarkdownProcessor, ARRAY, { format: 'table' });
    expect(r.output?.value).toContain('|');
    expect(r.output?.value).toContain('---');
  });

  it('produces headers from object keys', () => {
    const r = run(jsonToMarkdownProcessor, ARRAY, { format: 'table' });
    expect(r.output?.value).toContain('name');
    expect(r.output?.value).toContain('age');
  });

  it('produces definition list format', () => {
    const r = run(jsonToMarkdownProcessor, ARRAY, { format: 'definition-list' });
    expect(r.output?.value).toContain('**');
  });

  it('produces code block format', () => {
    const r = run(jsonToMarkdownProcessor, ARRAY, { format: 'code-block' });
    expect(r.output?.value).toContain('```json');
  });

  it('single object produces key/value table', () => {
    const r = run(jsonToMarkdownProcessor, '{"name":"Alice","age":28}', { format: 'table' });
    expect(r.output?.value).toContain('Key');
    expect(r.output?.value).toContain('Value');
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonToMarkdownProcessor, ARRAY);
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('output.md');
  });

  it('autoProcess is true', () => {
    expect(jsonToMarkdownProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON Schema Generator
// ---------------------------------------------------------------------------

describe('json-schema-generator', () => {
  it('returns error on empty input', () => {
    expect(run(jsonSchemaGeneratorProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonSchemaGeneratorProcessor, '{bad}').error).toBeTruthy();
  });

  it('returns error for array input (not object)', () => {
    expect(run(jsonSchemaGeneratorProcessor, '[1,2,3]').error).toBeTruthy();
  });

  it('generates a valid JSON Schema with $schema', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"name":"Alice","age":30}');
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.$schema).toBeTruthy();
    expect(parsed.type).toBe('object');
  });

  it('infers string type', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"name":"Alice"}');
    const schema = JSON.parse(r.output!.value);
    expect(schema.properties.name.type).toBe('string');
  });

  it('infers integer type', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"age":30}');
    const schema = JSON.parse(r.output!.value);
    expect(schema.properties.age.type).toBe('integer');
  });

  it('infers number type for floats', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"score":9.5}');
    const schema = JSON.parse(r.output!.value);
    expect(schema.properties.score.type).toBe('number');
  });

  it('infers boolean type', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"active":true}');
    const schema = JSON.parse(r.output!.value);
    expect(schema.properties.active.type).toBe('boolean');
  });

  it('marks all properties required by default', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"a":1,"b":2}', { markAllRequired: true });
    const schema = JSON.parse(r.output!.value);
    expect(schema.required).toContain('a');
    expect(schema.required).toContain('b');
  });

  it('draft-2020-12 option produces 2020-12 schema URL', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"a":1}', { draft: 'draft-2020-12' });
    const schema = JSON.parse(r.output!.value);
    expect(schema.$schema).toContain('2020-12');
  });

  it('nested objects produce object schema nodes', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"user":{"name":"Alice"}}');
    const schema = JSON.parse(r.output!.value);
    expect(schema.properties.user.type).toBe('object');
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonSchemaGeneratorProcessor, '{"a":1}');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('schema.json');
  });

  it('autoProcess is true', () => {
    expect(jsonSchemaGeneratorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON Table Viewer
// ---------------------------------------------------------------------------

describe('json-table-viewer', () => {
  const ROWS = '[{"name":"Alice","age":28},{"name":"Bob","age":35}]';

  it('returns error on empty input', () => {
    expect(run(jsonTableViewerProcessor, '').error).toBeTruthy();
  });

  it('returns error on non-array input', () => {
    expect(run(jsonTableViewerProcessor, '{"a":1}').error).toBeTruthy();
  });

  it('returns error on empty array', () => {
    expect(run(jsonTableViewerProcessor, '[]').error).toBeTruthy();
  });

  it('renders unicode box table by default', () => {
    const r = run(jsonTableViewerProcessor, ROWS, { style: 'unicode-box' });
    expect(r.output?.value).toContain('┌');
  });

  it('renders ASCII table', () => {
    const r = run(jsonTableViewerProcessor, ROWS, { style: 'ascii' });
    expect(r.output?.value).toContain('+--');
  });

  it('renders markdown table', () => {
    const r = run(jsonTableViewerProcessor, ROWS, { style: 'markdown-table' });
    expect(r.output?.value).toContain('|');
    expect(r.output?.value).toContain('---');
  });

  it('reports rows and columns in meta', () => {
    const r = run(jsonTableViewerProcessor, ROWS);
    expect(r.meta?.['rows']).toBe(2);
    expect(r.meta?.['columns']).toBe(2);
  });

  it('output is copyable', () => {
    const r = run(jsonTableViewerProcessor, ROWS);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is true', () => {
    expect(jsonTableViewerProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSON to TypeScript
// ---------------------------------------------------------------------------

describe('json-to-typescript', () => {
  const OBJ = '{"name":"Alice","age":30,"active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToTypescriptProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToTypescriptProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates TypeScript interface by default', () => {
    const r = run(jsonToTypescriptProcessor, OBJ, { useInterface: true });
    expect(r.output?.value).toContain('interface RootObject');
  });

  it('generates type alias when useInterface is false', () => {
    const r = run(jsonToTypescriptProcessor, OBJ, { useInterface: false });
    expect(r.output?.value).toContain('type RootObject =');
  });

  it('adds export keyword', () => {
    const r = run(jsonToTypescriptProcessor, OBJ, { exportKeyword: true });
    expect(r.output?.value).toContain('export');
  });

  it('marks fields optional when option set', () => {
    const r = run(jsonToTypescriptProcessor, OBJ, { optionalFields: true });
    expect(r.output?.value).toContain('?:');
  });

  it('infers string type correctly', () => {
    const r = run(jsonToTypescriptProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('name');
    expect(r.output?.value).toContain('string');
  });

  it('infers number type', () => {
    const r = run(jsonToTypescriptProcessor, '{"score":9.5}');
    expect(r.output?.value).toContain('number');
  });

  it('handles array input and generates RootArray', () => {
    const r = run(jsonToTypescriptProcessor, '[{"id":1,"name":"Alice"}]');
    expect(r.output?.value).toContain('RootArray');
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonToTypescriptProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('types.ts');
  });

  it('autoProcess is false', () => {
    expect(jsonToTypescriptProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Python
// ---------------------------------------------------------------------------

describe('json-to-python', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToPythonProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToPythonProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates dataclass by default', () => {
    const r = run(jsonToPythonProcessor, OBJ, { style: 'dataclass' });
    expect(r.output?.value).toContain('@dataclass');
    expect(r.output?.value).toContain('class RootObject');
  });

  it('generates TypedDict when style is typeddict', () => {
    const r = run(jsonToPythonProcessor, OBJ, { style: 'typeddict' });
    expect(r.output?.value).toContain('TypedDict');
  });

  it('generates dict literal when style is dict-literal', () => {
    const r = run(jsonToPythonProcessor, OBJ, { style: 'dict-literal' });
    expect(r.output?.value).toContain('data =');
    expect(r.output?.value).toContain("'name':");
  });

  it('infers str type for strings', () => {
    const r = run(jsonToPythonProcessor, '{"name":"Alice"}', { style: 'dataclass' });
    expect(r.output?.value).toContain('str');
  });

  it('infers int type for integers', () => {
    const r = run(jsonToPythonProcessor, '{"age":30}', { style: 'dataclass' });
    expect(r.output?.value).toContain('int');
  });

  it('infers bool type for booleans', () => {
    const r = run(jsonToPythonProcessor, '{"active":true}', { style: 'dataclass' });
    expect(r.output?.value).toContain('bool');
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonToPythonProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toMatch(/\.py$/);
  });

  it('autoProcess is false', () => {
    expect(jsonToPythonProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to C#
// ---------------------------------------------------------------------------

describe('json-to-csharp', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToCsharpProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToCsharpProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates a C# class', () => {
    const r = run(jsonToCsharpProcessor, OBJ);
    expect(r.output?.value).toContain('class');
    // C# generator uses 'Root' as the root class name
    expect(r.output?.value).toContain('public class Root');
  });

  it('produces int type for integers', () => {
    const r = run(jsonToCsharpProcessor, '{"age":30}');
    expect(r.output?.value).toContain('int');
  });

  it('produces string type for strings', () => {
    const r = run(jsonToCsharpProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('string');
  });

  it('produces bool type for booleans', () => {
    const r = run(jsonToCsharpProcessor, '{"active":true}');
    expect(r.output?.value).toContain('bool');
  });

  it('output is copyable', () => {
    const r = run(jsonToCsharpProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToCsharpProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Go
// ---------------------------------------------------------------------------

describe('json-to-go', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToGoProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToGoProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates a Go struct', () => {
    const r = run(jsonToGoProcessor, OBJ);
    expect(r.output?.value).toContain('type');
    expect(r.output?.value).toContain('struct {');
  });

  it('includes json struct tags', () => {
    const r = run(jsonToGoProcessor, OBJ);
    expect(r.output?.value).toContain('`json:"');
  });

  it('produces int64 for integers', () => {
    const r = run(jsonToGoProcessor, '{"age":30}');
    expect(r.output?.value).toContain('int64');
  });

  it('produces string type', () => {
    const r = run(jsonToGoProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('string');
  });

  it('output is copyable', () => {
    const r = run(jsonToGoProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToGoProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Kotlin
// ---------------------------------------------------------------------------

describe('json-to-kotlin', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToKotlinProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToKotlinProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates a Kotlin data class', () => {
    const r = run(jsonToKotlinProcessor, OBJ);
    expect(r.output?.value).toContain('data class');
  });

  it('produces String type for strings', () => {
    const r = run(jsonToKotlinProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('String');
  });

  it('produces Int or Long for integers', () => {
    const r = run(jsonToKotlinProcessor, '{"age":30}');
    const value = r.output?.value ?? '';
    expect(value.includes('Int') || value.includes('Long')).toBe(true);
  });

  it('output is copyable', () => {
    const r = run(jsonToKotlinProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToKotlinProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Swift
// ---------------------------------------------------------------------------

describe('json-to-swift', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToSwiftProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToSwiftProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates a Swift struct', () => {
    const r = run(jsonToSwiftProcessor, OBJ);
    expect(r.output?.value).toContain('struct');
  });

  it('implements Codable', () => {
    const r = run(jsonToSwiftProcessor, OBJ);
    expect(r.output?.value).toContain('Codable');
  });

  it('produces String type for strings', () => {
    const r = run(jsonToSwiftProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('String');
  });

  it('produces Bool type for booleans', () => {
    const r = run(jsonToSwiftProcessor, '{"active":true}');
    expect(r.output?.value).toContain('Bool');
  });

  it('output is copyable', () => {
    const r = run(jsonToSwiftProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToSwiftProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to Rust
// ---------------------------------------------------------------------------

describe('json-to-rust', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToRustProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToRustProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates a Rust struct', () => {
    const r = run(jsonToRustProcessor, OBJ);
    expect(r.output?.value).toContain('struct');
  });

  it('derives Serialize and Deserialize', () => {
    const r = run(jsonToRustProcessor, OBJ);
    const value = r.output?.value ?? '';
    expect(value.includes('Serialize') || value.includes('Deserialize') || value.includes('serde')).toBe(true);
  });

  it('produces String type for strings', () => {
    const r = run(jsonToRustProcessor, '{"name":"Alice"}');
    expect(r.output?.value).toContain('String');
  });

  it('produces i64 for integers', () => {
    const r = run(jsonToRustProcessor, '{"age":30}');
    expect(r.output?.value).toContain('i64');
  });

  it('output is copyable', () => {
    const r = run(jsonToRustProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToRustProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JSON to PHP
// ---------------------------------------------------------------------------

describe('json-to-php', () => {
  const OBJ = '{"id":1,"name":"Alice","active":true}';

  it('returns error on empty input', () => {
    expect(run(jsonToPhpProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonToPhpProcessor, '{bad}').error).toBeTruthy();
  });

  it('generates PHP class by default', () => {
    const r = run(jsonToPhpProcessor, OBJ, { style: 'class' });
    expect(r.output?.value).toContain('class');
  });

  it('generates PHP array output', () => {
    const r = run(jsonToPhpProcessor, OBJ, { style: 'array' });
    expect(r.output?.value).toContain('$data');
  });

  it('generates stdClass output', () => {
    const r = run(jsonToPhpProcessor, OBJ, { style: 'stdClass' });
    // stdClass style uses json_decode which returns a stdClass
    expect(r.output?.value).toContain('json_decode');
  });

  it('output is copyable', () => {
    const r = run(jsonToPhpProcessor, OBJ);
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is false', () => {
    expect(jsonToPhpProcessor.autoProcess).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Registry — all 19 new tools registered
// ---------------------------------------------------------------------------

describe('registry — M13 new tools', () => {
  const registrySrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/registry.ts'),
    'utf8',
  );

  const newIds = [
    'json-repair',
    'json-flatten',
    'json-size-analyzer',
    'json-search',
    'json-stringify',
    'json-token-counter',
    'jsonc-to-json',
    'json-to-sql',
    'json-to-markdown',
    'json-schema-generator',
    'json-table-viewer',
    'json-to-typescript',
    'json-to-python',
    'json-to-csharp',
    'json-to-go',
    'json-to-kotlin',
    'json-to-swift',
    'json-to-rust',
    'json-to-php',
  ];

  for (const id of newIds) {
    it(`'${id}' is in registry.ts`, () => {
      expect(registrySrc).toContain(`id: '${id}'`);
    });
  }
});

// ---------------------------------------------------------------------------
// Processor index — all 19 new tools wired
// ---------------------------------------------------------------------------

describe('processor index — M13 registrations', () => {
  const indexSrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/processors/index.ts'),
    'utf8',
  );

  const newIds = [
    'json-repair',
    'json-flatten',
    'json-size-analyzer',
    'json-search',
    'json-stringify',
    'json-token-counter',
    'jsonc-to-json',
    'json-to-sql',
    'json-to-markdown',
    'json-schema-generator',
    'json-table-viewer',
    'json-to-typescript',
    'json-to-python',
    'json-to-csharp',
    'json-to-go',
    'json-to-kotlin',
    'json-to-swift',
    'json-to-rust',
    'json-to-php',
  ];

  for (const id of newIds) {
    it(`'${id}' is in processorLoaders`, () => {
      expect(indexSrc).toContain(`'${id}'`);
    });
  }
});
