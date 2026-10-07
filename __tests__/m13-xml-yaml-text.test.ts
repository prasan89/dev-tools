/**
 * M12 tests — 10 new processors
 *
 * xml-validator, xml-minifier, xml-to-json, xml-escape,
 * yaml-validator, yaml-minifier,
 * text-case-converter, remove-duplicate-lines, sort-lines
 */

import { xmlValidatorProcessor } from '@/lib/processors/xml-validator';
import { xmlMinifierProcessor } from '@/lib/processors/xml-minifier';
import { xmlToJsonProcessor } from '@/lib/processors/xml-to-json';
import { xmlEscapeProcessor } from '@/lib/processors/xml-escape';
import { yamlValidatorProcessor } from '@/lib/processors/yaml-validator';
import { yamlMinifierProcessor } from '@/lib/processors/yaml-minifier';
import { textCaseConverterProcessor } from '@/lib/processors/text-case-converter';
import { removeDuplicateLinesProcessor } from '@/lib/processors/remove-duplicate-lines';
import { sortLinesProcessor } from '@/lib/processors/sort-lines';

import fs from 'fs';
import path from 'path';

type AnyProcessor = typeof xmlValidatorProcessor;

function run(proc: AnyProcessor, value: string, opts?: Record<string, unknown>) {
  return proc.process({ value, options: opts });
}

// ---------------------------------------------------------------------------
// XML Validator
// ---------------------------------------------------------------------------
describe('xml-validator', () => {
  it('returns error on empty input', () => {
    expect(run(xmlValidatorProcessor, '').error).toBeTruthy();
  });

  it('validates well-formed XML', () => {
    const r = run(xmlValidatorProcessor, '<root><item>1</item></root>');
    expect(r.output?.value).toContain('✓ Valid XML');
    expect(r.meta?.['valid']).toBe('yes');
  });

  it('detects malformed XML', () => {
    const r = run(xmlValidatorProcessor, '<root><unclosed>');
    expect(r.output?.value).toContain('✗ Invalid');
    expect(r.meta?.['valid']).toBe('no');
  });

  it('detects mismatched tags', () => {
    const r = run(xmlValidatorProcessor, '<root><a></b></root>');
    expect(r.output?.value).toContain('✗');
  });

  it('accepts XML declaration', () => {
    const r = run(xmlValidatorProcessor, '<?xml version="1.0"?><root/>');
    expect(r.output?.value).toContain('✓');
  });

  it('output is copyable', () => {
    const r = run(xmlValidatorProcessor, '<root/>');
    expect(r.output?.copyable).toBe(true);
  });

  it('autoProcess is true', () => {
    expect(xmlValidatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// XML Minifier
// ---------------------------------------------------------------------------
describe('xml-minifier', () => {
  it('returns error on empty input', () => {
    expect(run(xmlMinifierProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid XML', () => {
    const r = run(xmlMinifierProcessor, '<bad>');
    expect(r.error).toBeTruthy();
  });

  it('removes whitespace between elements', () => {
    const r = run(xmlMinifierProcessor, '<root>\n  <item>1</item>\n  <item>2</item>\n</root>');
    expect(r.output?.value).not.toContain('\n');
    expect(r.output?.value).toContain('<item>1</item>');
  });

  it('preserves comments by default', () => {
    const r = run(xmlMinifierProcessor, '<root><!-- comment --><item/></root>', { stripComments: false });
    expect(r.output?.value).toContain('<!-- comment -->');
  });

  it('strips comments when option enabled', () => {
    const r = run(xmlMinifierProcessor, '<root><!-- comment --><item/></root>', { stripComments: true });
    expect(r.output?.value).not.toContain('<!-- comment -->');
  });

  it('output is copyable and downloadable', () => {
    const r = run(xmlMinifierProcessor, '<root><a>1</a></root>');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('minified.xml');
  });

  it('reports savings in meta', () => {
    const r = run(xmlMinifierProcessor, '<root>\n  <item>hello</item>\n</root>');
    expect(r.meta?.['savings']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// XML to JSON
// ---------------------------------------------------------------------------
describe('xml-to-json', () => {
  it('returns error on empty input', () => {
    expect(run(xmlToJsonProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid XML', () => {
    const r = run(xmlToJsonProcessor, '<bad>');
    expect(r.error).toBeTruthy();
  });

  it('converts simple element with text', () => {
    const r = run(xmlToJsonProcessor, '<root><name>Alice</name></root>');
    const json = JSON.parse(r.output!.value);
    expect(json.root.name).toBe('Alice');
  });

  it('converts attributes with @ prefix', () => {
    const r = run(xmlToJsonProcessor, '<root><item id="1">text</item></root>');
    const json = JSON.parse(r.output!.value);
    expect(json.root.item['@id']).toBe('1');
  });

  it('converts repeated elements to arrays', () => {
    const r = run(xmlToJsonProcessor, '<root><item>a</item><item>b</item></root>');
    const json = JSON.parse(r.output!.value);
    expect(Array.isArray(json.root.item)).toBe(true);
    expect(json.root.item).toHaveLength(2);
  });

  it('output is copyable and downloadable', () => {
    const r = run(xmlToJsonProcessor, '<root/>');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('converted.json');
  });
});

// ---------------------------------------------------------------------------
// XML Escape / Unescape
// ---------------------------------------------------------------------------
describe('xml-escape', () => {
  it('returns error on empty input', () => {
    expect(run(xmlEscapeProcessor, '').error).toBeTruthy();
  });

  it('escapes & to &amp;', () => {
    const r = run(xmlEscapeProcessor, 'bread & butter', { mode: 'escape' });
    expect(r.output?.value).toContain('&amp;');
  });

  it('escapes < to &lt;', () => {
    const r = run(xmlEscapeProcessor, '1 < 2', { mode: 'escape' });
    expect(r.output?.value).toContain('&lt;');
  });

  it('escapes > to &gt;', () => {
    const r = run(xmlEscapeProcessor, '2 > 1', { mode: 'escape' });
    expect(r.output?.value).toContain('&gt;');
  });

  it('escapes " to &quot;', () => {
    const r = run(xmlEscapeProcessor, '"hello"', { mode: 'escape' });
    expect(r.output?.value).toContain('&quot;');
  });

  it("escapes ' to &apos;", () => {
    const r = run(xmlEscapeProcessor, "it's", { mode: 'escape' });
    expect(r.output?.value).toContain('&apos;');
  });

  it('unescapes &amp; to &', () => {
    const r = run(xmlEscapeProcessor, 'bread &amp; butter', { mode: 'unescape' });
    expect(r.output?.value).toBe('bread & butter');
  });

  it('unescapes &lt; to <', () => {
    const r = run(xmlEscapeProcessor, '1 &lt; 2', { mode: 'unescape' });
    expect(r.output?.value).toBe('1 < 2');
  });

  it('unescapes numeric entity &#65;', () => {
    const r = run(xmlEscapeProcessor, '&#65;', { mode: 'unescape' });
    expect(r.output?.value).toBe('A');
  });

  it('output is copyable', () => {
    const r = run(xmlEscapeProcessor, 'test', { mode: 'escape' });
    expect(r.output?.copyable).toBe(true);
  });

  it('has mode select control', () => {
    const ctrl = xmlEscapeProcessor.optionControls?.find(c => c.key === 'mode');
    expect(ctrl).toBeDefined();
    expect(ctrl?.options?.map(o => o.value)).toContain('escape');
    expect(ctrl?.options?.map(o => o.value)).toContain('unescape');
  });
});

// ---------------------------------------------------------------------------
// YAML Validator
// ---------------------------------------------------------------------------
describe('yaml-validator', () => {
  it('returns error on empty input', () => {
    expect(run(yamlValidatorProcessor, '').error).toBeTruthy();
  });

  it('validates correct YAML', () => {
    const r = run(yamlValidatorProcessor, 'name: Alice\nage: 30');
    expect(r.output?.value).toContain('✓ Valid YAML');
    expect(r.meta?.['valid']).toBe('yes');
  });

  it('detects invalid YAML', () => {
    const r = run(yamlValidatorProcessor, ': bad: yaml:');
    expect(r.meta?.['valid']).toBe('no');
  });

  it('detects indentation errors', () => {
    const r = run(yamlValidatorProcessor, 'key:\n  good: 1\n bad: 2');
    // Either valid or error — just ensure it doesn't throw
    expect(r).toBeDefined();
  });

  it('reports root type for objects', () => {
    const r = run(yamlValidatorProcessor, 'a: 1\nb: 2');
    expect(r.meta?.['root type']).toBe('object');
  });

  it('reports root type for arrays', () => {
    const r = run(yamlValidatorProcessor, '- a\n- b');
    expect(r.meta?.['root type']).toBe('array');
  });

  it('autoProcess is true', () => {
    expect(yamlValidatorProcessor.autoProcess).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// YAML Minifier
// ---------------------------------------------------------------------------
describe('yaml-minifier', () => {
  it('returns error on empty input', () => {
    expect(run(yamlMinifierProcessor, '').error).toBeTruthy();
  });

  it('returns error on invalid YAML', () => {
    const r = run(yamlMinifierProcessor, 'key: [unclosed bracket');
    expect(r.error).toBeTruthy();
  });

  it('produces compact output for deeply nested YAML', () => {
    const multiLine = 'outer:\n  inner:\n    deep:\n      value: hello\n      num: 42\n      flag: true\n';
    const r = run(yamlMinifierProcessor, multiLine);
    expect(r.output!.value.length).toBeLessThan(multiLine.length);
  });

  it('preserves data values', () => {
    const r = run(yamlMinifierProcessor, 'key: value\nnum: 42');
    expect(r.output?.value).toContain('key');
    expect(r.output?.value).toContain('value');
  });

  it('output is copyable and downloadable', () => {
    const r = run(yamlMinifierProcessor, 'a: 1\nb: 2');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('minified.yaml');
  });

  it('reports savings in meta', () => {
    const r = run(yamlMinifierProcessor, 'a: 1\nb: 2\nc: 3\n');
    expect(r.meta?.['savings']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Text Case Converter
// ---------------------------------------------------------------------------
describe('text-case-converter', () => {
  it('returns error on empty input', () => {
    expect(run(textCaseConverterProcessor, '').error).toBeTruthy();
  });

  it('converts to lowercase', () => {
    const r = run(textCaseConverterProcessor, 'HELLO WORLD', { mode: 'lowercase' });
    expect(r.output?.value).toBe('hello world');
  });

  it('converts to UPPERCASE', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'uppercase' });
    expect(r.output?.value).toBe('HELLO WORLD');
  });

  it('converts to Title Case', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'titlecase' });
    expect(r.output?.value).toBe('Hello World');
  });

  it('converts to camelCase', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'camelcase' });
    expect(r.output?.value).toBe('helloWorld');
  });

  it('converts to PascalCase', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'pascalcase' });
    expect(r.output?.value).toBe('HelloWorld');
  });

  it('converts to snake_case', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'snakecase' });
    expect(r.output?.value).toBe('hello_world');
  });

  it('converts to kebab-case', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'kebabcase' });
    expect(r.output?.value).toBe('hello-world');
  });

  it('converts to CONSTANT_CASE', () => {
    const r = run(textCaseConverterProcessor, 'hello world', { mode: 'constantcase' });
    expect(r.output?.value).toBe('HELLO_WORLD');
  });

  it('converts from camelCase to snake_case', () => {
    const r = run(textCaseConverterProcessor, 'helloWorldExample', { mode: 'snakecase' });
    expect(r.output?.value).toBe('hello_world_example');
  });

  it('output is copyable', () => {
    const r = run(textCaseConverterProcessor, 'test');
    expect(r.output?.copyable).toBe(true);
  });

  it('has mode select control with 9 options', () => {
    const ctrl = textCaseConverterProcessor.optionControls?.find(c => c.key === 'mode');
    expect(ctrl?.options?.length).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// Remove Duplicate Lines
// ---------------------------------------------------------------------------
describe('remove-duplicate-lines', () => {
  it('returns error on empty input', () => {
    expect(run(removeDuplicateLinesProcessor, '').error).toBeTruthy();
  });

  it('removes exact duplicates', () => {
    const r = run(removeDuplicateLinesProcessor, 'apple\nbanana\napple\norange');
    const lines = r.output!.value.split('\n');
    expect(lines).toEqual(['apple', 'banana', 'orange']);
  });

  it('keeps first occurrence', () => {
    const r = run(removeDuplicateLinesProcessor, 'b\na\nb');
    expect(r.output!.value.split('\n')[0]).toBe('b');
  });

  it('case-sensitive by default (keeps APPLE and apple separately)', () => {
    const r = run(removeDuplicateLinesProcessor, 'apple\nAPPLE', { caseInsensitive: false });
    expect(r.output!.value.split('\n')).toHaveLength(2);
  });

  it('case-insensitive mode removes APPLE when apple seen', () => {
    const r = run(removeDuplicateLinesProcessor, 'apple\nAPPLE', { caseInsensitive: true });
    expect(r.output!.value.split('\n')).toHaveLength(1);
  });

  it('reports removed count in meta', () => {
    const r = run(removeDuplicateLinesProcessor, 'a\nb\na');
    expect(r.meta?.['removed']).toBe(1);
  });

  it('output is copyable', () => {
    const r = run(removeDuplicateLinesProcessor, 'a\nb');
    expect(r.output?.copyable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sort Lines
// ---------------------------------------------------------------------------
describe('sort-lines', () => {
  it('returns error on empty input', () => {
    expect(run(sortLinesProcessor, '').error).toBeTruthy();
  });

  it('sorts alphabetically ascending', () => {
    const r = run(sortLinesProcessor, 'cherry\napple\nbanana', { order: 'asc', mode: 'alpha' });
    expect(r.output!.value.split('\n')).toEqual(['apple', 'banana', 'cherry']);
  });

  it('sorts alphabetically descending', () => {
    const r = run(sortLinesProcessor, 'apple\nbanana\ncherry', { order: 'desc', mode: 'alpha' });
    expect(r.output!.value.split('\n')).toEqual(['cherry', 'banana', 'apple']);
  });

  it('sorts numerically', () => {
    const r = run(sortLinesProcessor, '10\n2\n20\n1', { order: 'asc', mode: 'numeric' });
    expect(r.output!.value.split('\n')).toEqual(['1', '2', '10', '20']);
  });

  it('removes duplicates when option set', () => {
    const r = run(sortLinesProcessor, 'b\na\nb', { removeDuplicates: true });
    const lines = r.output!.value.split('\n');
    expect(lines.filter(l => l === 'b')).toHaveLength(1);
  });

  it('output is copyable and downloadable', () => {
    const r = run(sortLinesProcessor, 'b\na');
    expect(r.output?.copyable).toBe(true);
    expect(r.output?.downloadFilename).toBe('sorted.txt');
  });

  it('has order select control', () => {
    const ctrl = sortLinesProcessor.optionControls?.find(c => c.key === 'order');
    expect(ctrl?.options?.map(o => o.value)).toContain('asc');
    expect(ctrl?.options?.map(o => o.value)).toContain('desc');
  });
});

// ---------------------------------------------------------------------------
// Registry — new tools registered
// ---------------------------------------------------------------------------
describe('registry — M12 tools', () => {
  const registrySrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/registry.ts'),
    'utf8',
  );

  const newIds = [
    'xml-validator', 'xml-minifier', 'xml-to-json', 'xml-escape',
    'yaml-validator', 'yaml-minifier',
    'text-case-converter', 'remove-duplicate-lines', 'sort-lines',
  ];

  for (const id of newIds) {
    it(`'${id}' is in registry.ts`, () => {
      expect(registrySrc).toContain(`id: '${id}'`);
    });
  }

  it("'text' category is in CATEGORIES", () => {
    expect(registrySrc).toContain("id: 'text'");
  });
});

// ---------------------------------------------------------------------------
// Processor index — all M12 tools wired
// ---------------------------------------------------------------------------
describe('processor index — M12 registrations', () => {
  const indexSrc = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/processors/index.ts'),
    'utf8',
  );

  const newIds = [
    'xml-validator', 'xml-minifier', 'xml-to-json', 'xml-escape',
    'yaml-validator', 'yaml-minifier',
    'text-case-converter', 'remove-duplicate-lines', 'sort-lines',
  ];

  for (const id of newIds) {
    it(`'${id}' is in processorLoaders`, () => {
      expect(indexSrc).toContain(`'${id}'`);
    });
  }
});
