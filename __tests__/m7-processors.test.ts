/**
 * M7 processor tests — json-to-csv, csv-to-json, json-to-yaml, json-to-xml
 */

import { jsonToCsvProcessor } from '@/lib/processors/json-to-csv';
import { csvToJsonProcessor } from '@/lib/processors/csv-to-json';
import { jsonToYamlProcessor } from '@/lib/processors/json-to-yaml';
import { jsonToXmlProcessor } from '@/lib/processors/json-to-xml';
import { getProcessor } from '@/lib/processors/index';
import { TOOLS, CATEGORIES, getToolById, getToolsByCategory } from '@/lib/registry';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function run(proc: typeof jsonToCsvProcessor, value: string, opts?: Record<string, unknown>) {
  return proc.process({ value, options: opts });
}

// ---------------------------------------------------------------------------
// json-to-csv
// ---------------------------------------------------------------------------
describe('json-to-csv processor', () => {
  describe('valid input', () => {
    it('converts simple array of objects', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1,"b":2},{"a":3,"b":4}]');
      expect(r.error).toBeUndefined();
      expect(r.output?.value).toBe('a,b\r\n1,2\r\n3,4');
    });

    it('uses CRLF line endings', () => {
      const r = run(jsonToCsvProcessor, '[{"x":"hello"}]');
      expect(r.output?.value).toContain('\r\n');
    });

    it('produces header row', () => {
      const r = run(jsonToCsvProcessor, '[{"name":"Alice","age":30}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[0]).toBe('name,age');
    });

    it('produces data rows', () => {
      const r = run(jsonToCsvProcessor, '[{"name":"Alice","age":30},{"name":"Bob","age":25}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[1]).toBe('Alice,30');
      expect(lines[2]).toBe('Bob,25');
    });

    it('quotes fields containing commas', () => {
      const r = run(jsonToCsvProcessor, '[{"city":"New York, USA"}]');
      expect(r.output?.value).toContain('"New York, USA"');
    });

    it('quotes fields containing double-quotes (escapes them)', () => {
      const r = run(jsonToCsvProcessor, '[{"msg":"say \\"hello\\""}]');
      expect(r.output?.value).toContain('"say ""hello"""');
    });

    it('quotes fields containing newlines', () => {
      const r = run(jsonToCsvProcessor, '[{"note":"line1\\nline2"}]');
      expect(r.output?.value).toContain('"line1\nline2"');
    });

    it('handles null values as empty string', () => {
      const r = run(jsonToCsvProcessor, '[{"a":null,"b":1}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[1]).toBe(',1');
    });

    it('handles undefined/missing fields as empty', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1,"b":2},{"a":3}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[1]).toBe('1,2');
      expect(lines[2]).toBe('3,');
    });

    it('handles boolean values', () => {
      const r = run(jsonToCsvProcessor, '[{"active":true,"deleted":false}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[1]).toBe('true,false');
    });

    it('handles number values', () => {
      const r = run(jsonToCsvProcessor, '[{"x":3.14,"y":-1}]');
      const lines = r.output?.value?.split('\r\n') ?? [];
      expect(lines[1]).toBe('3.14,-1');
    });

    it('serializes nested objects as JSON strings (CSV-escaped)', () => {
      const r = run(jsonToCsvProcessor, '[{"meta":{"k":"v"}}]');
      // JSON.stringify({k:"v"}) = {"k":"v"} — quotes in CSV field are double-escaped
      expect(r.output?.value).toContain('"{"');
    });

    it('serializes nested arrays as JSON strings (CSV-escaped)', () => {
      const r = run(jsonToCsvProcessor, '[{"tags":["a","b"]}]');
      // The CSV field wraps ["a","b"] in quotes and escapes inner quotes
      expect(r.output?.value).toContain('"[');
      expect(r.output?.value).toContain('a');
      expect(r.output?.value).toContain('b');
    });

    it('collects union of all keys for headers', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1},{"b":2}]');
      const header = r.output?.value?.split('\r\n')[0] ?? '';
      expect(header).toContain('a');
      expect(header).toContain('b');
    });

    it('handles Unicode', () => {
      const r = run(jsonToCsvProcessor, '[{"名前":"山田"}]');
      expect(r.output?.value).toContain('名前');
      expect(r.output?.value).toContain('山田');
    });

    it('handles emoji', () => {
      const r = run(jsonToCsvProcessor, '[{"icon":"🚀"}]');
      expect(r.output?.value).toContain('🚀');
    });

    it('supports semicolon delimiter', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1,"b":2}]', { delimiter: ';' });
      expect(r.output?.value).toContain('a;b');
      expect(r.output?.value).toContain('1;2');
    });

    it('supports tab delimiter', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1,"b":2}]', { delimiter: 'tab' });
      expect(r.output?.value).toContain('a\tb');
    });

    it('supports pipe delimiter', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1}]', { delimiter: '|' });
      expect(r.output?.value).toContain('a');
    });

    it('reports row count in meta', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1},{"a":2},{"a":3}]');
      expect(r.meta?.rows).toBe(3);
    });

    it('reports column count in meta', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1,"b":2,"c":3}]');
      expect(r.meta?.columns).toBe(3);
    });

    it('sets downloadFilename to output.csv', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1}]');
      expect(r.output?.downloadFilename).toBe('output.csv');
    });

    it('sets correct MIME type', () => {
      const r = run(jsonToCsvProcessor, '[{"a":1}]');
      expect(r.output?.downloadMime).toBe('text/csv');
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      expect(run(jsonToCsvProcessor, '').error).toBeTruthy();
    });

    it('returns error for invalid JSON', () => {
      expect(run(jsonToCsvProcessor, '{bad json}').error).toMatch(/invalid json/i);
    });

    it('returns error for non-array input', () => {
      expect(run(jsonToCsvProcessor, '{"a":1}').error).toMatch(/array/i);
    });

    it('returns error for JSON string scalar', () => {
      expect(run(jsonToCsvProcessor, '"hello"').error).toBeTruthy();
    });

    it('returns error for empty array', () => {
      expect(run(jsonToCsvProcessor, '[]').error).toBeTruthy();
    });

    it('returns error for array of non-objects with no keys', () => {
      expect(run(jsonToCsvProcessor, '[[1,2],[3,4]]').error).toBeTruthy();
    });
  });

  describe('configuration', () => {
    it('has autoProcess true', () => {
      expect(jsonToCsvProcessor.autoProcess).toBe(true);
    });

    it('has delimiter optionControl', () => {
      const c = jsonToCsvProcessor.optionControls?.find(c => c.key === 'delimiter');
      expect(c).toBeDefined();
      expect(c?.type).toBe('select');
    });

    it('has exampleInput', () => {
      expect(jsonToCsvProcessor.exampleInput).toBeTruthy();
      expect(() => JSON.parse(jsonToCsvProcessor.exampleInput!)).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// csv-to-json
// ---------------------------------------------------------------------------
describe('csv-to-json processor', () => {
  describe('basic parsing', () => {
    it('converts CSV with headers to array of objects', () => {
      const r = run(csvToJsonProcessor, 'name,age\nAlice,30\nBob,25', { headers: true });
      expect(r.error).toBeUndefined();
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr).toHaveLength(2);
      expect(arr[0]).toEqual({ name: 'Alice', age: '30' });
      expect(arr[1]).toEqual({ name: 'Bob', age: '25' });
    });

    it('converts CSV without headers to array of arrays', () => {
      const r = run(csvToJsonProcessor, '1,2\n3,4', { headers: false });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr).toHaveLength(2);
      expect(arr[0]).toEqual(['1', '2']);
    });

    it('handles quoted fields containing commas', () => {
      const r = run(csvToJsonProcessor, 'city\n"New York, USA"', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0].city).toBe('New York, USA');
    });

    it('handles quoted fields containing newlines', () => {
      const r = run(csvToJsonProcessor, 'note\n"line1\nline2"', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0].note).toBe('line1\nline2');
    });

    it('handles double-quote escaping inside quoted fields', () => {
      const r = run(csvToJsonProcessor, 'msg\n"say ""hello"""', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0].msg).toBe('say "hello"');
    });

    it('handles CRLF line endings', () => {
      const r = run(csvToJsonProcessor, 'a,b\r\n1,2\r\n3,4', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr).toHaveLength(2);
    });

    it('handles LF line endings', () => {
      const r = run(csvToJsonProcessor, 'a,b\n1,2\n3,4', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr).toHaveLength(2);
    });

    it('handles empty values', () => {
      const r = run(csvToJsonProcessor, 'a,b,c\n1,,3', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0].b).toBe('');
    });

    it('handles missing fields on short rows', () => {
      const r = run(csvToJsonProcessor, 'a,b,c\n1,2', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0].c).toBe('');
    });

    it('handles Unicode characters', () => {
      const r = run(csvToJsonProcessor, '名前,年齢\n山田,30', { headers: true });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0]['名前']).toBe('山田');
    });

    it('handles semicolon delimiter', () => {
      const r = run(csvToJsonProcessor, 'a;b\n1;2', { headers: true, delimiter: ';' });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0]).toEqual({ a: '1', b: '2' });
    });

    it('handles tab delimiter', () => {
      const r = run(csvToJsonProcessor, 'a\tb\n1\t2', { headers: true, delimiter: 'tab' });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0]).toEqual({ a: '1', b: '2' });
    });

    it('handles pipe delimiter', () => {
      const r = run(csvToJsonProcessor, 'a|b\n1|2', { headers: true, delimiter: '|' });
      const arr = JSON.parse(r.output?.value ?? '');
      expect(arr[0]).toEqual({ a: '1', b: '2' });
    });

    it('produces compact JSON with indent 0', () => {
      const r = run(csvToJsonProcessor, 'a\n1', { headers: true, indent: '0' });
      expect(r.output?.value).not.toContain('\n');
    });

    it('produces 4-space indented JSON with indent 4', () => {
      const r = run(csvToJsonProcessor, 'a\n1', { headers: true, indent: '4' });
      expect(r.output?.value).toContain('    ');
    });

    it('sets downloadFilename to output.json', () => {
      const r = run(csvToJsonProcessor, 'a\n1', { headers: true });
      expect(r.output?.downloadFilename).toBe('output.json');
    });

    it('sets correct MIME type', () => {
      const r = run(csvToJsonProcessor, 'a\n1', { headers: true });
      expect(r.output?.downloadMime).toBe('application/json');
    });

    it('output is valid parseable JSON', () => {
      const r = run(csvToJsonProcessor, 'name,score\nAlice,100\nBob,95', { headers: true });
      expect(() => JSON.parse(r.output?.value ?? '')).not.toThrow();
    });

    it('reports row count in meta', () => {
      const r = run(csvToJsonProcessor, 'a\n1\n2\n3', { headers: true });
      expect(r.meta?.rows).toBe(3);
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      expect(run(csvToJsonProcessor, '').error).toBeTruthy();
    });

    it('returns error for whitespace-only input', () => {
      expect(run(csvToJsonProcessor, '   ').error).toBeTruthy();
    });
  });

  describe('configuration', () => {
    it('has autoProcess true', () => {
      expect(csvToJsonProcessor.autoProcess).toBe(true);
    });

    it('has delimiter optionControl', () => {
      const c = csvToJsonProcessor.optionControls?.find(c => c.key === 'delimiter');
      expect(c).toBeDefined();
    });

    it('has headers optionControl defaulting to true', () => {
      const c = csvToJsonProcessor.optionControls?.find(c => c.key === 'headers');
      expect(c?.defaultValue).toBe(true);
    });

    it('has indent optionControl', () => {
      const c = csvToJsonProcessor.optionControls?.find(c => c.key === 'indent');
      expect(c).toBeDefined();
    });

    it('has exampleInput', () => {
      expect(csvToJsonProcessor.exampleInput).toBeTruthy();
    });
  });
});

// ---------------------------------------------------------------------------
// json-to-yaml
// ---------------------------------------------------------------------------
describe('json-to-yaml processor', () => {
  describe('valid input', () => {
    it('converts simple object', () => {
      const r = run(jsonToYamlProcessor, '{"name":"Alice","age":30}');
      expect(r.error).toBeUndefined();
      expect(r.output?.value).toContain('name: Alice');
      expect(r.output?.value).toContain('age: 30');
    });

    it('converts nested object', () => {
      const r = run(jsonToYamlProcessor, '{"a":{"b":{"c":1}}}');
      expect(r.output?.value).toContain('a:');
      expect(r.output?.value).toContain('b:');
      expect(r.output?.value).toContain('c: 1');
    });

    it('converts array', () => {
      const r = run(jsonToYamlProcessor, '[1,2,3]');
      expect(r.output?.value).toContain('- 1');
      expect(r.output?.value).toContain('- 2');
      expect(r.output?.value).toContain('- 3');
    });

    it('converts array of objects', () => {
      const r = run(jsonToYamlProcessor, '[{"x":1},{"x":2}]');
      expect(r.output?.value).toContain('x: 1');
      expect(r.output?.value).toContain('x: 2');
    });

    it('converts boolean values', () => {
      const r = run(jsonToYamlProcessor, '{"active":true,"deleted":false}');
      expect(r.output?.value).toContain('true');
      expect(r.output?.value).toContain('false');
    });

    it('converts null to YAML null', () => {
      const r = run(jsonToYamlProcessor, '{"val":null}');
      // js-yaml serializes null as null or ~
      expect(r.output?.value).toMatch(/null|~/);
    });

    it('handles Unicode', () => {
      const r = run(jsonToYamlProcessor, '{"msg":"こんにちは"}');
      expect(r.output?.value).toContain('こんにちは');
    });

    it('handles numbers', () => {
      const r = run(jsonToYamlProcessor, '{"pi":3.14159,"neg":-1}');
      expect(r.output?.value).toContain('3.14159');
      expect(r.output?.value).toContain('-1');
    });

    it('handles empty object', () => {
      const r = run(jsonToYamlProcessor, '{}');
      expect(r.error).toBeUndefined();
    });

    it('handles empty array', () => {
      const r = run(jsonToYamlProcessor, '[]');
      expect(r.error).toBeUndefined();
    });

    it('produces 4-space indented output with indent 4', () => {
      const r = run(jsonToYamlProcessor, '{"a":{"b":1}}', { indent: '4' });
      expect(r.output?.value).toContain('    b:');
    });

    it('sort keys option produces alphabetical key order', () => {
      const r = run(jsonToYamlProcessor, '{"z":1,"a":2,"m":3}', { sortKeys: true });
      const val = r.output?.value ?? '';
      expect(val.indexOf('a:')).toBeLessThan(val.indexOf('m:'));
      expect(val.indexOf('m:')).toBeLessThan(val.indexOf('z:'));
    });

    it('sets downloadFilename to output.yaml', () => {
      const r = run(jsonToYamlProcessor, '{"a":1}');
      expect(r.output?.downloadFilename).toBe('output.yaml');
    });

    it('sets correct MIME type', () => {
      const r = run(jsonToYamlProcessor, '{"a":1}');
      expect(r.output?.downloadMime).toBe('text/yaml');
    });

    it('includes input/output bytes in meta', () => {
      const r = run(jsonToYamlProcessor, '{"a":1}');
      expect(r.meta?.['input bytes']).toBeGreaterThan(0);
      expect(r.meta?.['output bytes']).toBeGreaterThan(0);
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      expect(run(jsonToYamlProcessor, '').error).toBeTruthy();
    });

    it('returns error for invalid JSON', () => {
      expect(run(jsonToYamlProcessor, '{bad}').error).toMatch(/invalid json/i);
    });

    it('returns error for malformed JSON', () => {
      expect(run(jsonToYamlProcessor, '{"a": }').error).toBeTruthy();
    });
  });

  describe('configuration', () => {
    it('has autoProcess true', () => {
      expect(jsonToYamlProcessor.autoProcess).toBe(true);
    });

    it('has indent optionControl', () => {
      const c = jsonToYamlProcessor.optionControls?.find(c => c.key === 'indent');
      expect(c).toBeDefined();
      expect(c?.type).toBe('select');
    });

    it('has sortKeys optionControl', () => {
      const c = jsonToYamlProcessor.optionControls?.find(c => c.key === 'sortKeys');
      expect(c?.type).toBe('checkbox');
      expect(c?.defaultValue).toBe(false);
    });

    it('has valid exampleInput JSON', () => {
      expect(() => JSON.parse(jsonToYamlProcessor.exampleInput!)).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// json-to-xml
// ---------------------------------------------------------------------------
describe('json-to-xml processor', () => {
  describe('valid input', () => {
    it('produces XML declaration', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}');
      expect(r.output?.value).toMatch(/^<\?xml version="1\.0"/);
    });

    it('wraps in root element by default', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}');
      expect(r.output?.value).toContain('<root>');
      expect(r.output?.value).toContain('</root>');
    });

    it('converts simple object to child elements', () => {
      const r = run(jsonToXmlProcessor, '{"name":"Alice","age":30}');
      expect(r.output?.value).toContain('<name>Alice</name>');
      expect(r.output?.value).toContain('<age>30</age>');
    });

    it('converts nested objects', () => {
      const r = run(jsonToXmlProcessor, '{"user":{"name":"Bob"}}');
      expect(r.output?.value).toContain('<user>');
      expect(r.output?.value).toContain('<name>Bob</name>');
      expect(r.output?.value).toContain('</user>');
    });

    it('converts array as repeated sibling elements', () => {
      const r = run(jsonToXmlProcessor, '{"tags":["a","b","c"]}');
      const val = r.output?.value ?? '';
      const tagCount = (val.match(/<tags>/g) ?? []).length;
      expect(tagCount).toBe(3);
    });

    it('converts boolean values to text', () => {
      const r = run(jsonToXmlProcessor, '{"active":true}');
      expect(r.output?.value).toContain('<active>true</active>');
    });

    it('converts null to xsi:nil element', () => {
      const r = run(jsonToXmlProcessor, '{"val":null}');
      expect(r.output?.value).toContain('xsi:nil="true"');
    });

    it('adds xsi namespace declaration when null present', () => {
      const r = run(jsonToXmlProcessor, '{"val":null}');
      expect(r.output?.value).toContain('xmlns:xsi=');
    });

    it('escapes & in text content', () => {
      const r = run(jsonToXmlProcessor, '{"msg":"A & B"}');
      expect(r.output?.value).toContain('A &amp; B');
    });

    it('escapes < in text content', () => {
      const r = run(jsonToXmlProcessor, '{"code":"x < y"}');
      expect(r.output?.value).toContain('x &lt; y');
    });

    it('escapes > in text content', () => {
      const r = run(jsonToXmlProcessor, '{"code":"x > y"}');
      expect(r.output?.value).toContain('x &gt; y');
    });

    it('handles Unicode', () => {
      const r = run(jsonToXmlProcessor, '{"city":"東京"}');
      expect(r.output?.value).toContain('東京');
    });

    it('uses <data> root when configured', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}', { rootElement: 'data' });
      expect(r.output?.value).toContain('<data>');
      expect(r.output?.value).toContain('</data>');
    });

    it('uses <document> root when configured', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}', { rootElement: 'document' });
      expect(r.output?.value).toContain('<document>');
    });

    it('no root wrapper with "none" for object input', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}', { rootElement: 'none' });
      expect(r.output?.value).not.toContain('<root>');
      expect(r.output?.value).toContain('<a>1</a>');
    });

    it('returns error for "none" with array input', () => {
      const r = run(jsonToXmlProcessor, '[1,2,3]', { rootElement: 'none' });
      expect(r.error).toBeTruthy();
    });

    it('returns error for "none" with string input', () => {
      const r = run(jsonToXmlProcessor, '"hello"', { rootElement: 'none' });
      expect(r.error).toBeTruthy();
    });

    it('handles key starting with digit — sanitizes to _1', () => {
      const r = run(jsonToXmlProcessor, '{"1invalid":"val"}');
      expect(r.output?.value).toContain('<_1invalid>');
    });

    it('handles empty object', () => {
      const r = run(jsonToXmlProcessor, '{}');
      expect(r.error).toBeUndefined();
    });

    it('handles empty array wrapped in root', () => {
      const r = run(jsonToXmlProcessor, '[]');
      expect(r.error).toBeUndefined();
    });

    it('4-space indent option produces indented output', () => {
      const r = run(jsonToXmlProcessor, '{"a":{"b":1}}', { indent: '4' });
      expect(r.output?.value).toContain('    <b>');
    });

    it('sets downloadFilename to output.xml', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}');
      expect(r.output?.downloadFilename).toBe('output.xml');
    });

    it('sets correct MIME type', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}');
      expect(r.output?.downloadMime).toBe('application/xml');
    });

    it('includes byte counts in meta', () => {
      const r = run(jsonToXmlProcessor, '{"a":1}');
      expect(r.meta?.['input bytes']).toBeGreaterThan(0);
      expect(r.meta?.['output bytes']).toBeGreaterThan(0);
    });
  });

  describe('error cases', () => {
    it('returns error for empty input', () => {
      expect(run(jsonToXmlProcessor, '').error).toBeTruthy();
    });

    it('returns error for invalid JSON', () => {
      expect(run(jsonToXmlProcessor, '{bad}').error).toMatch(/invalid json/i);
    });
  });

  describe('configuration', () => {
    it('has autoProcess true', () => {
      expect(jsonToXmlProcessor.autoProcess).toBe(true);
    });

    it('has rootElement optionControl', () => {
      const c = jsonToXmlProcessor.optionControls?.find(c => c.key === 'rootElement');
      expect(c).toBeDefined();
      expect(c?.type).toBe('select');
      expect(c?.defaultValue).toBe('root');
    });

    it('has indent optionControl', () => {
      const c = jsonToXmlProcessor.optionControls?.find(c => c.key === 'indent');
      expect(c).toBeDefined();
    });

    it('has valid exampleInput', () => {
      expect(() => JSON.parse(jsonToXmlProcessor.exampleInput!)).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Registry integration
// ---------------------------------------------------------------------------
describe('M7 registry integration', () => {
  const m7Ids = ['json-to-csv', 'csv-to-json', 'json-to-yaml', 'json-to-xml'];

  m7Ids.forEach(id => {
    it(`${id} is registered in TOOLS`, () => {
      expect(TOOLS.find(t => t.id === id)).toBeDefined();
    });

    it(`${id} is enabled`, () => {
      expect(TOOLS.find(t => t.id === id)?.enabled).toBe(true);
    });

    it(`${id} has seoTitle`, () => {
      expect(getToolById(id)?.seoTitle.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has seoDescription`, () => {
      expect(getToolById(id)?.seoDescription.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has relatedTools`, () => {
      const tool = getToolById(id);
      expect(tool?.relatedTools?.length).toBeGreaterThan(0);
    });

    it(`${id} has a processor`, async () => {
      expect(await getProcessor(id)).toBeDefined();
    });
  });

  it('json-to-csv is in json category', () => {
    expect(getToolById('json-to-csv')?.category).toBe('json');
  });

  it('csv-to-json is in json category', () => {
    expect(getToolById('csv-to-json')?.category).toBe('json');
  });

  it('json-to-yaml is in json category', () => {
    expect(getToolById('json-to-yaml')?.category).toBe('json');
  });

  it('json-to-xml is in json category', () => {
    expect(getToolById('json-to-xml')?.category).toBe('json');
  });

  it('json category now has 8 tools', () => {
    const jsonTools = getToolsByCategory('json');
    expect(jsonTools.length).toBeGreaterThanOrEqual(8);
  });

  it('no duplicate tool IDs in registry', () => {
    const ids = TOOLS.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('no duplicate tool slugs in registry', () => {
    const slugs = TOOLS.map(t => t.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('total enabled tools is at least 25', () => {
    const enabled = TOOLS.filter(t => t.enabled);
    expect(enabled.length).toBeGreaterThanOrEqual(25);
  });

  it('json-formatter relatedTools includes json-to-csv', () => {
    expect(getToolById('json-formatter')?.relatedTools).toContain('json-to-csv');
  });

  it('json-formatter relatedTools includes json-to-yaml', () => {
    expect(getToolById('json-formatter')?.relatedTools).toContain('json-to-yaml');
  });

  it('json-formatter relatedTools includes json-to-xml', () => {
    expect(getToolById('json-formatter')?.relatedTools).toContain('json-to-xml');
  });
});

// ---------------------------------------------------------------------------
// Roundtrip: json-to-csv → csv-to-json → json matches original
// ---------------------------------------------------------------------------
describe('JSON→CSV→JSON roundtrip', () => {
  it('survives simple roundtrip', () => {
    const original = [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }];
    const csv = jsonToCsvProcessor.process({ value: JSON.stringify(original) });
    expect(csv.error).toBeUndefined();
    const back = csvToJsonProcessor.process({ value: csv.output!.value, options: { headers: true } });
    expect(back.error).toBeUndefined();
    const restored = JSON.parse(back.output!.value);
    expect(restored).toEqual(original);
  });

  it('survives roundtrip with quoted comma values', () => {
    const original = [{ city: 'New York, USA', score: '100' }];
    const csv = jsonToCsvProcessor.process({ value: JSON.stringify(original) });
    const back = csvToJsonProcessor.process({ value: csv.output!.value, options: { headers: true } });
    const restored = JSON.parse(back.output!.value);
    expect(restored[0].city).toBe('New York, USA');
  });
});
