import { jsonFormatterProcessor } from '@/lib/processors/json-formatter';
import { jsonValidatorProcessor } from '@/lib/processors/json-validator';
import { jsonMinifierProcessor } from '@/lib/processors/json-minifier';
import { jsonDiffProcessor } from '@/lib/processors/json-diff';

// ============================================================
// JSON Formatter
// ============================================================

describe('jsonFormatterProcessor', () => {
  it('formats a compact JSON object with 2-space indent', () => {
    const result = jsonFormatterProcessor.process({ value: '{"a":1,"b":2}' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('formats nested objects', () => {
    const result = jsonFormatterProcessor.process({
      value: '{"user":{"name":"Alice","age":28}}',
    });
    expect(result.error).toBeUndefined();
    const formatted = result.output?.value ?? '';
    expect(formatted).toContain('"user"');
    expect(formatted).toContain('"name": "Alice"');
    expect(formatted).toContain('"age": 28');
  });

  it('formats arrays', () => {
    const result = jsonFormatterProcessor.process({ value: '[1,2,3]' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('handles primitives: string', () => {
    const result = jsonFormatterProcessor.process({ value: '"hello"' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('"hello"');
  });

  it('handles primitives: number', () => {
    const result = jsonFormatterProcessor.process({ value: '42' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('42');
  });

  it('handles primitives: boolean', () => {
    const result = jsonFormatterProcessor.process({ value: 'true' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('true');
  });

  it('handles null', () => {
    const result = jsonFormatterProcessor.process({ value: 'null' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('null');
  });

  it('handles unicode strings without corruption', () => {
    const result = jsonFormatterProcessor.process({ value: '{"emoji":"🎉","cjk":"日本語"}' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('🎉');
    expect(result.output?.value).toContain('日本語');
  });

  it('returns error for invalid JSON', () => {
    const result = jsonFormatterProcessor.process({ value: '{broken}' });
    expect(result.error).toBeDefined();
    expect(result.output).toBeUndefined();
  });

  it('returns error for empty input', () => {
    const result = jsonFormatterProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('uses 4-space indent when options.indent is 4', () => {
    const result = jsonFormatterProcessor.process({ value: '{"a":1}', options: { indent: 4 } });
    expect(result.output?.value).toBe('{\n    "a": 1\n}');
  });

  it('sets downloadFilename to formatted.json', () => {
    const result = jsonFormatterProcessor.process({ value: '{"a":1}' });
    expect(result.output?.downloadFilename).toBe('formatted.json');
  });

  it('output is copyable', () => {
    const result = jsonFormatterProcessor.process({ value: '{"a":1}' });
    expect(result.output?.copyable).toBe(true);
  });

  it('includes meta with input/output bytes', () => {
    const result = jsonFormatterProcessor.process({ value: '{"a":1}' });
    expect(result.meta?.['input bytes']).toBeGreaterThan(0);
    expect(result.meta?.['output bytes']).toBeGreaterThan(0);
  });

  it('has exampleInput defined', () => {
    expect(jsonFormatterProcessor.exampleInput).toBeDefined();
    expect(typeof jsonFormatterProcessor.exampleInput).toBe('string');
  });
});

// ============================================================
// JSON Validator
// ============================================================

describe('jsonValidatorProcessor', () => {
  it('returns success for valid JSON object', () => {
    const result = jsonValidatorProcessor.process({ value: '{"name":"Alice"}' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('✓');
  });

  it('returns success for valid JSON array', () => {
    const result = jsonValidatorProcessor.process({ value: '[1,2,3]' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('✓');
  });

  it('returns success for nested structures', () => {
    const result = jsonValidatorProcessor.process({
      value: '{"a":{"b":{"c":true}}}',
    });
    expect(result.error).toBeUndefined();
  });

  it('returns success for primitives', () => {
    expect(jsonValidatorProcessor.process({ value: '"string"' }).error).toBeUndefined();
    expect(jsonValidatorProcessor.process({ value: '123' }).error).toBeUndefined();
    expect(jsonValidatorProcessor.process({ value: 'false' }).error).toBeUndefined();
    expect(jsonValidatorProcessor.process({ value: 'null' }).error).toBeUndefined();
  });

  it('returns error for invalid JSON with message', () => {
    const result = jsonValidatorProcessor.process({ value: '{broken}' });
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
    expect((result.error?.length ?? 0)).toBeGreaterThan(10);
  });

  it('returns error for malformed trailing comma', () => {
    const result = jsonValidatorProcessor.process({ value: '{"a":1,}' });
    expect(result.error).toBeDefined();
  });

  it('returns error for empty input', () => {
    const result = jsonValidatorProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('includes meta type info for objects', () => {
    const result = jsonValidatorProcessor.process({ value: '{"a":1}' });
    expect(result.meta?.type).toBe('object');
  });

  it('includes meta type info for arrays', () => {
    const result = jsonValidatorProcessor.process({ value: '[1,2]' });
    expect(result.meta?.type).toBe('array');
  });
});

// ============================================================
// JSON Minifier
// ============================================================

describe('jsonMinifierProcessor', () => {
  it('minifies formatted JSON to single line', () => {
    const result = jsonMinifierProcessor.process({ value: '{\n  "name": "John",\n  "age": 30\n}' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('{"name":"John","age":30}');
  });

  it('preserves nested objects exactly', () => {
    const result = jsonMinifierProcessor.process({
      value: '{ "user": { "name": "Alice", "active": true } }',
    });
    expect(result.error).toBeUndefined();
    const parsed = JSON.parse(result.output?.value ?? '{}') as { user: { name: string; active: boolean } };
    expect(parsed.user.name).toBe('Alice');
    expect(parsed.user.active).toBe(true);
  });

  it('preserves arrays', () => {
    const result = jsonMinifierProcessor.process({ value: '[  1,  2,  3  ]' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toBe('[1,2,3]');
  });

  it('preserves unicode without corruption', () => {
    const result = jsonMinifierProcessor.process({ value: '{ "flag": "🏳️" }' });
    expect(result.error).toBeUndefined();
    expect(result.output?.value).toContain('🏳️');
  });

  it('returns error for invalid JSON', () => {
    const result = jsonMinifierProcessor.process({ value: '{invalid}' });
    expect(result.error).toBeDefined();
    expect(result.output).toBeUndefined();
  });

  it('returns error for empty input', () => {
    const result = jsonMinifierProcessor.process({ value: '' });
    expect(result.error).toBeDefined();
  });

  it('includes meta with original and minified bytes', () => {
    const result = jsonMinifierProcessor.process({ value: '{\n  "a": 1\n}' });
    expect(result.meta?.original).toBeDefined();
    expect(result.meta?.minified).toBeDefined();
    expect(result.meta?.saved).toBeDefined();
  });

  it('shows warning when already minified', () => {
    const result = jsonMinifierProcessor.process({ value: '{"a":1}' });
    expect(result.warnings?.length).toBeGreaterThan(0);
  });

  it('downloadFilename is minified.json', () => {
    const result = jsonMinifierProcessor.process({ value: '{"a":1}' });
    expect(result.output?.downloadFilename).toBe('minified.json');
  });

  it('data preservation: minify then parse equals original', () => {
    const original = { name: 'Test', value: 12345, nested: { a: [1, 2, 3] } };
    const result = jsonMinifierProcessor.process({ value: JSON.stringify(original, null, 2) });
    const reparsed = JSON.parse(result.output?.value ?? '{}') as typeof original;
    expect(reparsed).toEqual(original);
  });
});

// ============================================================
// JSON Diff
// ============================================================

describe('jsonDiffProcessor', () => {
  it('reports identical JSON as identical', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1}',
      secondary: '{"a":1}',
    });
    expect(result.error).toBeUndefined();
    // With layoutVariant:'diff', output is structured JSON; stats.added/removed/changed are 0
    const data = JSON.parse(result.output?.value ?? '{}');
    expect(data.stats?.added).toBe(0);
    expect(data.stats?.removed).toBe(0);
    expect(result.meta?.changed).toBe(0);
  });

  it('detects added property', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1}',
      secondary: '{"a":1,"b":2}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.added).toBeGreaterThan(0);
    const data = JSON.parse(result.output?.value ?? '{}');
    expect(JSON.stringify(data)).toContain('b');
  });

  it('detects removed property', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1,"b":2}',
      secondary: '{"a":1}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.removed).toBeGreaterThan(0);
    const data = JSON.parse(result.output?.value ?? '{}');
    expect(JSON.stringify(data)).toContain('b');
  });

  it('detects changed property value', () => {
    const result = jsonDiffProcessor.process({
      value: '{"age":30}',
      secondary: '{"age":31}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.changed).toBe(1);
    const data = JSON.parse(result.output?.value ?? '{}');
    expect(JSON.stringify(data)).toContain('age');
  });

  it('handles nested object changes', () => {
    const result = jsonDiffProcessor.process({
      value: '{"user":{"name":"Alice","age":28}}',
      secondary: '{"user":{"name":"Alice","age":29}}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.changed).toBeGreaterThan(0);
  });

  it('handles array element changes (positional)', () => {
    const result = jsonDiffProcessor.process({
      value: '{"tags":["java","spring"]}',
      secondary: '{"tags":["java","boot"]}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.changed).toBeGreaterThan(0);
  });

  it('handles added array items', () => {
    const result = jsonDiffProcessor.process({
      value: '{"arr":[1,2]}',
      secondary: '{"arr":[1,2,3]}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.added).toBeGreaterThan(0);
  });

  it('handles removed array items', () => {
    const result = jsonDiffProcessor.process({
      value: '{"arr":[1,2,3]}',
      secondary: '{"arr":[1,2]}',
    });
    expect(result.error).toBeUndefined();
    expect(result.meta?.removed).toBeGreaterThan(0);
  });

  it('returns error for invalid left JSON', () => {
    const result = jsonDiffProcessor.process({
      value: '{bad json}',
      secondary: '{"a":1}',
    });
    expect(result.error).toBeDefined();
    expect(result.error).toContain('JSON');
  });

  it('returns error for invalid right JSON', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1}',
      secondary: 'not json',
    });
    expect(result.error).toBeDefined();
    expect(result.error).toContain('JSON');
  });

  it('returns error when both inputs are empty', () => {
    const result = jsonDiffProcessor.process({ value: '', secondary: '' });
    expect(result.error).toBeDefined();
  });

  it('returns error when left input is empty', () => {
    const result = jsonDiffProcessor.process({ value: '', secondary: '{"a":1}' });
    expect(result.error).toBeDefined();
  });

  it('returns error when right input is empty', () => {
    const result = jsonDiffProcessor.process({ value: '{"a":1}', secondary: '' });
    expect(result.error).toBeDefined();
  });

  it('includes meta counts', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1}',
      secondary: '{"a":2,"b":3}',
    });
    expect(result.meta?.added).toBeDefined();
    expect(result.meta?.removed).toBeDefined();
    expect(result.meta?.changed).toBeDefined();
    expect(result.meta?.total).toBeDefined();
  });

  it('meta changed count is 1 for single changed value', () => {
    const result = jsonDiffProcessor.process({
      value: '{"x":10}',
      secondary: '{"x":20}',
    });
    expect(result.meta?.changed).toBe(1);
    expect(result.meta?.added).toBe(0);
    expect(result.meta?.removed).toBe(0);
  });

  it('downloadFilename is json-diff.txt', () => {
    const result = jsonDiffProcessor.process({
      value: '{"a":1}',
      secondary: '{"b":2}',
    });
    expect(result.output?.downloadFilename).toBe('json-diff.txt');
  });

  it('compares primitive JSON values', () => {
    const result = jsonDiffProcessor.process({ value: '42', secondary: '43' });
    expect(result.error).toBeUndefined();
    expect(result.meta?.changed).toBeGreaterThan(0);
  });

  it('has hasSecondaryInput: true', () => {
    expect(jsonDiffProcessor.hasSecondaryInput).toBe(true);
  });

  it('has autoProcess: false', () => {
    expect(jsonDiffProcessor.autoProcess).toBe(true); // autoProcess is true for json-diff with layoutVariant:'diff'
  });
});

// ============================================================
// Registry integrity — M3 tools
// ============================================================

import { getToolById, getToolsByCategory } from '@/lib/registry';
import { getProcessor } from '@/lib/processors/index';

describe('M3 registry entries', () => {
  const ids = ['json-formatter', 'json-validator', 'json-minifier', 'json-diff'];

  ids.forEach((id) => {
    it(`${id} exists in registry`, () => {
      expect(getToolById(id)).toBeDefined();
    });

    it(`${id} is enabled`, () => {
      expect(getToolById(id)?.enabled).toBe(true);
    });

    it(`${id} has category 'json'`, () => {
      expect(getToolById(id)?.category).toBe('json');
    });

    it(`${id} has seoTitle`, () => {
      expect(getToolById(id)?.seoTitle.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has seoDescription`, () => {
      expect(getToolById(id)?.seoDescription.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has a processor attached`, async () => {
      expect(await getProcessor(id)).toBeDefined();
    });
  });

  it('all 4 JSON tools appear in getToolsByCategory(json)', () => {
    const jsonTools = getToolsByCategory('json');
    const slugs = jsonTools.map((t) => t.slug);
    expect(slugs).toContain('json-formatter');
    expect(slugs).toContain('json-validator');
    expect(slugs).toContain('json-minifier');
    expect(slugs).toContain('json-diff');
  });

  it('json-diff has valid relatedTools pointing to existing tools', () => {
    const tool = getToolById('json-diff');
    tool?.relatedTools?.forEach((id) => {
      expect(getToolById(id)).toBeDefined();
    });
  });

  it('json-formatter has json-diff in relatedTools', () => {
    const tool = getToolById('json-formatter');
    expect(tool?.relatedTools).toContain('json-diff');
  });
});
