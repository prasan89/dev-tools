/**
 * M12 tests — 6 new processors + registry/category coverage
 *
 * Covers: json-escape, json-sorter, csv-formatter, csv-validator,
 *         jsonpath-tester (sync/offline interface only),
 *         json-schema-validator (sync/offline interface only)
 */

import { jsonEscapeProcessor } from '@/lib/processors/json-escape';
import { jsonSorterProcessor } from '@/lib/processors/json-sorter';
import { csvFormatterProcessor } from '@/lib/processors/csv-formatter';
import { csvValidatorProcessor } from '@/lib/processors/csv-validator';
import { jsonpathTesterProcessor } from '@/lib/processors/jsonpath-tester';
import { jsonSchemaValidatorProcessor } from '@/lib/processors/json-schema-validator';

import fs from 'fs';
import path from 'path';

function run(
  proc: typeof jsonEscapeProcessor,
  value: string,
  opts?: Record<string, unknown>,
  secondary?: string,
) {
  return proc.process({ value, secondary, options: opts });
}

// ---------------------------------------------------------------------------
// JSON Escape / Unescape
// ---------------------------------------------------------------------------
describe('json-escape', () => {
  it('returns error on empty input', () => {
    expect(run(jsonEscapeProcessor, '').error).toBeTruthy();
  });

  it('escapes double quotes', () => {
    const r = run(jsonEscapeProcessor, 'say "hello"', { mode: 'escape' });
    expect(r.output?.value).toBe('say \\"hello\\"');
  });

  it('escapes newline', () => {
    const r = run(jsonEscapeProcessor, 'line1\nline2', { mode: 'escape' });
    expect(r.output?.value).toContain('\\n');
  });

  it('escapes tab', () => {
    const r = run(jsonEscapeProcessor, 'col1\tcol2', { mode: 'escape' });
    expect(r.output?.value).toContain('\\t');
  });

  it('escapes backslash', () => {
    const r = run(jsonEscapeProcessor, 'path\\file', { mode: 'escape' });
    expect(r.output?.value).toContain('\\\\');
  });

  it('unescapes \\n back to newline', () => {
    const r = run(jsonEscapeProcessor, 'line1\\nline2', { mode: 'unescape' });
    expect(r.output?.value).toContain('\n');
  });

  it('unescapes \\" back to quote', () => {
    const r = run(jsonEscapeProcessor, 'say \\"hello\\"', { mode: 'unescape' });
    expect(r.output?.value).toBe('say "hello"');
  });

  it('returns error for invalid escape sequence when unescaping', () => {
    // lone backslash that is not a valid JSON escape
    const r = run(jsonEscapeProcessor, '\\q', { mode: 'unescape' });
    expect(r.error).toBeTruthy();
  });

  it('output is copyable', () => {
    const r = run(jsonEscapeProcessor, 'test', { mode: 'escape' });
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is true', () => {
    expect(jsonEscapeProcessor.autoProcess).toBe(true);
  });

  it('has mode select control', () => {
    const ctrl = jsonEscapeProcessor.optionControls?.find(c => c.key === 'mode');
    expect(ctrl).toBeDefined();
    expect(ctrl?.type).toBe('select');
    expect(ctrl?.options?.map(o => o.value)).toContain('escape');
    expect(ctrl?.options?.map(o => o.value)).toContain('unescape');
  });
});

// ---------------------------------------------------------------------------
// JSON Sorter
// ---------------------------------------------------------------------------
describe('json-sorter', () => {
  it('returns error on empty input', () => {
    expect(run(jsonSorterProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    expect(run(jsonSorterProcessor, '{bad}').error).toBeTruthy();
  });

  it('sorts keys ascending', () => {
    const r = run(jsonSorterProcessor, '{"z":1,"a":2,"m":3}', { order: 'asc' });
    const keys = Object.keys(JSON.parse(r.output!.value));
    expect(keys).toEqual(['a', 'm', 'z']);
  });

  it('sorts keys descending', () => {
    const r = run(jsonSorterProcessor, '{"z":1,"a":2,"m":3}', { order: 'desc' });
    const keys = Object.keys(JSON.parse(r.output!.value));
    expect(keys).toEqual(['z', 'm', 'a']);
  });

  it('sorts nested objects recursively', () => {
    const r = run(jsonSorterProcessor, '{"z":{"b":1,"a":2},"a":1}', { order: 'asc' });
    const parsed = JSON.parse(r.output!.value);
    expect(Object.keys(parsed)).toEqual(['a', 'z']);
    expect(Object.keys(parsed.z)).toEqual(['a', 'b']);
  });

  it('preserves array order', () => {
    const r = run(jsonSorterProcessor, '{"arr":[3,1,2]}', { order: 'asc' });
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.arr).toEqual([3, 1, 2]);
  });

  it('handles arrays at root', () => {
    const r = run(jsonSorterProcessor, '[{"z":1,"a":2}]', { order: 'asc' });
    const parsed = JSON.parse(r.output!.value);
    expect(Object.keys(parsed[0])).toEqual(['a', 'z']);
  });

  it('output is copyable and downloadable', () => {
    const r = run(jsonSorterProcessor, '{"b":1,"a":2}');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('sorted.json');
  });

  it('autoProcess is true', () => {
    expect(jsonSorterProcessor.autoProcess).toBe(true);
  });

  it('has order select control', () => {
    const ctrl = jsonSorterProcessor.optionControls?.find(c => c.key === 'order');
    expect(ctrl).toBeDefined();
    expect(ctrl?.options?.map(o => o.value)).toContain('asc');
    expect(ctrl?.options?.map(o => o.value)).toContain('desc');
  });
});

// ---------------------------------------------------------------------------
// CSV Formatter
// ---------------------------------------------------------------------------
describe('csv-formatter', () => {
  it('returns error on empty input', () => {
    expect(run(csvFormatterProcessor, '').error).toBeTruthy();
  });

  it('formats basic CSV', () => {
    const r = run(csvFormatterProcessor, 'a,b,c\n1,2,3');
    expect(r.output?.value).toContain('a,b,c');
    expect(r.output?.value).toContain('1,2,3');
  });

  it('preserves quoted fields', () => {
    const r = run(csvFormatterProcessor, 'name,city\n"Alice","New York"');
    expect(r.output?.value).toContain('Alice');
    expect(r.output?.value).toContain('New York');
  });

  it('handles fields with commas inside quotes', () => {
    const r = run(csvFormatterProcessor, 'a,b\n"one, two",three');
    expect(r.output?.value).toContain('"one, two"');
  });

  it('handles escaped quotes inside fields', () => {
    const r = run(csvFormatterProcessor, 'a\n"say ""hello"""');
    // The formatted CSV preserves the quoted field (doubled quotes stay in CSV encoding)
    expect(r.output?.value).toContain('"say ""hello"""');
  });

  it('respects delimiter option', () => {
    const r = run(csvFormatterProcessor, 'a;b;c\n1;2;3', { delimiter: ';' });
    expect(r.output?.value).toContain('a;b;c');
  });

  it('output is copyable and downloadable', () => {
    const r = run(csvFormatterProcessor, 'a,b\n1,2');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('formatted.csv');
  });

  it('returns row count in meta', () => {
    const r = run(csvFormatterProcessor, 'a,b\n1,2\n3,4');
    expect(r.meta?.['rows']).toBe(3);
  });

  it('autoProcess is true', () => {
    expect(csvFormatterProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CSV Validator
// ---------------------------------------------------------------------------
describe('csv-validator', () => {
  it('returns error on empty input', () => {
    expect(run(csvValidatorProcessor, '').error).toBeTruthy();
  });

  it('reports valid CSV', () => {
    const r = run(csvValidatorProcessor, 'name,age\nAlice,30\nBob,25');
    expect(r.output?.value).toContain('✓ CSV is valid');
  });

  it('reports inconsistent column count', () => {
    const r = run(csvValidatorProcessor, 'a,b,c\n1,2\n3,4,5');
    expect(r.output?.value).toContain('Expected 3 columns but found 2');
  });

  it('reports unclosed quote', () => {
    const r = run(csvValidatorProcessor, 'a,b\n"unclosed,1');
    expect(r.output?.value).toContain('Unclosed');
  });

  it('returns meta with valid: yes for clean CSV', () => {
    const r = run(csvValidatorProcessor, 'x,y\n1,2');
    expect(r.meta?.['valid']).toBe('yes');
  });

  it('returns meta with valid: no for broken CSV', () => {
    const r = run(csvValidatorProcessor, 'a,b\n1,2,3');
    expect(r.meta?.['valid']).toBe('no');
  });

  it('output is copyable', () => {
    const r = run(csvValidatorProcessor, 'a,b\n1,2');
    expect(r.output?.copyable).toBe(true);
  });

  it('auto-detects tab delimiter', () => {
    const r = run(csvValidatorProcessor, 'a\tb\n1\t2');
    expect(r.output?.value).toContain('✓ CSV is valid');
  });

  it('autoProcess is true', () => {
    expect(csvValidatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// JSONPath Tester — sync interface checks only (library may not be loaded yet in test env)
// ---------------------------------------------------------------------------
describe('jsonpath-tester', () => {
  it('returns error on empty JSON input', () => {
    const r = run(jsonpathTesterProcessor, '', {}, '$.name');
    expect(r.error).toBeTruthy();
  });

  it('returns error when expression is missing', () => {
    const r = run(jsonpathTesterProcessor, '{"a":1}', {}, '');
    expect(r.error).toBeTruthy();
  });

  it('returns error on invalid JSON', () => {
    const r = run(jsonpathTesterProcessor, '{bad}', {}, '$.a');
    expect(r.error).toBeTruthy();
  });

  it('hasSecondaryInput is true', () => {
    expect(jsonpathTesterProcessor.hasSecondaryInput).toBe(true);
  });

  it('secondaryInputLabel is set', () => {
    expect(jsonpathTesterProcessor.secondaryInputLabel).toBeTruthy();
  });

  it('does not throw on valid JSON + expression (may return loading message)', () => {
    expect(() => {
      run(jsonpathTesterProcessor, '{"a":1}', {}, '$.a');
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// JSON Schema Validator — interface checks (Ajv may not be loaded yet in test env)
// ---------------------------------------------------------------------------
describe('json-schema-validator', () => {
  it('returns error on empty JSON data', () => {
    const r = run(jsonSchemaValidatorProcessor, '', {}, '{"type":"object"}');
    expect(r.error).toBeTruthy();
  });

  it('returns error when schema is missing', () => {
    const r = run(jsonSchemaValidatorProcessor, '{"a":1}', {}, '');
    expect(r.error).toBeTruthy();
  });

  it('returns error on invalid JSON data', () => {
    const r = run(jsonSchemaValidatorProcessor, '{bad}', {}, '{"type":"object"}');
    expect(r.error).toBeTruthy();
  });

  it('returns error on invalid JSON schema', () => {
    const r = run(jsonSchemaValidatorProcessor, '{"a":1}', {}, '{bad schema}');
    expect(r.error).toBeTruthy();
  });

  it('hasSecondaryInput is true', () => {
    expect(jsonSchemaValidatorProcessor.hasSecondaryInput).toBe(true);
  });

  it('secondaryInputLabel contains Schema', () => {
    expect(jsonSchemaValidatorProcessor.secondaryInputLabel).toMatch(/schema/i);
  });

  it('autoProcess is false (heavy validation, requires manual trigger)', () => {
    expect(jsonSchemaValidatorProcessor.autoProcess).toBe(false);
  });

  it('does not throw on valid JSON + schema (may return loading message)', () => {
    expect(() => {
      run(jsonSchemaValidatorProcessor, '{"a":1}', {}, '{"type":"object"}');
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Registry — new tools registered correctly
// ---------------------------------------------------------------------------
describe('registry — new tools', () => {
  const registrySrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/registry.ts'),
    'utf8',
  );

  const newIds = [
    'jsonpath-tester',
    'json-schema-validator',
    'json-escape',
    'json-sorter',
    'csv-formatter',
    'csv-validator',
  ];

  for (const id of newIds) {
    it(`'${id}' is in registry.ts`, () => {
      expect(registrySrc).toContain(`id: '${id}'`);
    });
  }

  it("'data' category is defined in CATEGORIES", () => {
    expect(registrySrc).toContain("id: 'data'");
  });
});

// ---------------------------------------------------------------------------
// Processor index — all 6 new tools wired
// ---------------------------------------------------------------------------
describe('processor index — new registrations', () => {
  const indexSrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/processors/index.ts'),
    'utf8',
  );

  const newIds = [
    'jsonpath-tester',
    'json-schema-validator',
    'json-escape',
    'json-sorter',
    'csv-formatter',
    'csv-validator',
  ];

  for (const id of newIds) {
    it(`'${id}' is in processorLoaders`, () => {
      expect(indexSrc).toContain(`'${id}'`);
    });
  }
});
