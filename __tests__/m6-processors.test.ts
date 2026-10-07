import { regexTesterProcessor } from '@/lib/processors/regex-tester';
import { sqlFormatterProcessor } from '@/lib/processors/sql-formatter';
import { xmlFormatterProcessor } from '@/lib/processors/xml-formatter';
import { yamlFormatterProcessor } from '@/lib/processors/yaml-formatter';
import { yamlToJsonProcessor } from '@/lib/processors/yaml-to-json';
import { getToolById, getToolsByCategory, CATEGORIES } from '@/lib/registry';
import { getProcessor } from '@/lib/processors/index';

// ============================================================
// Regex Tester
// ============================================================

describe('regexTesterProcessor', () => {
  function run(pattern: string, testStr: string, flags?: Record<string, boolean>) {
    const defaultFlags = { flag_g: true, flag_i: false, flag_m: false, flag_s: false, flag_u: false, flag_y: false };
    return regexTesterProcessor.process({ value: pattern, secondary: testStr, options: { ...defaultFlags, ...flags } });
  }

  it('returns error for empty pattern', () => {
    const r = run('', 'hello');
    expect(r.error).toBeDefined();
  });

  it('returns error for invalid pattern', () => {
    const r = run('[invalid', 'hello');
    expect(r.error).toBeDefined();
    expect(r.error).toContain('Invalid regular expression');
  });

  it('finds simple match', () => {
    const r = run('hello', 'hello world');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('1 match found');
    expect(r.output?.value).toContain('"hello"');
  });

  it('reports no matches when pattern does not match', () => {
    const r = run('xyz', 'hello world');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('No matches');
  });

  it('finds multiple matches with global flag', () => {
    const r = run('o', 'foo bar boo', { flag_g: true });
    // 'foo bar boo' has 4 o characters
    expect(r.output?.value).toContain('4 matches');
  });

  it('is case-insensitive with i flag', () => {
    const r = run('HELLO', 'hello world', { flag_g: false, flag_i: true });
    expect(r.output?.value).toContain('1 match');
  });

  it('reports match positions (index)', () => {
    const r = run('world', 'hello world');
    expect(r.output?.value).toContain('Index: 6');
  });

  it('returns valid when pattern is valid but no test string provided', () => {
    const r = regexTesterProcessor.process({ value: '\\d+', options: {} });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('valid');
  });

  it('handles capture groups', () => {
    const r = run('(\\w+)\\s(\\w+)', 'hello world');
    expect(r.output?.value).toContain('Group 1: hello');
    expect(r.output?.value).toContain('Group 2: world');
  });

  it('handles named capture groups', () => {
    const r = run('(?<first>\\w+)\\s(?<second>\\w+)', 'hello world');
    expect(r.output?.value).toContain('first: hello');
    expect(r.output?.value).toContain('second: world');
  });

  it('handles multiline flag', () => {
    const r = run('^line', 'line1\nline2', { flag_g: true, flag_m: true });
    expect(r.output?.value).toContain('2 matches');
  });

  it('handles Unicode characters in test string', () => {
    const r = run('[あ-ん]', 'こんにちは', { flag_g: true });
    expect(r.output?.value).toContain('matches');
  });

  it('handles special regex characters (dot)', () => {
    const r = run('.', 'abc', { flag_g: true });
    expect(r.output?.value).toContain('3 matches');
  });

  it('output is copyable for matches', () => {
    const r = run('hello', 'hello world');
    expect(r.output?.copyable).toBe(true);
  });

  it('output has downloadFilename', () => {
    const r = run('hello', 'hello world');
    expect(r.output?.downloadFilename).toBe('regex-matches.txt');
  });

  it('meta includes pattern and flags', () => {
    const r = run('hello', 'hello world');
    expect(r.meta?.pattern).toBe('hello');
  });

  it('handles example from spec: capitalized words', () => {
    const r = run('\\b[A-Z][a-z]+\\b', 'Hello from DevToolsHub. Java Spring Boot is great.', { flag_g: true });
    expect(r.output?.value).toContain('matches');
    expect(r.output?.value).toContain('"Hello"');
  });

  it('example input is defined', () => {
    expect(regexTesterProcessor.exampleInput).toBeDefined();
  });

  it('has optionControls with 6 flag checkboxes', () => {
    const controls = regexTesterProcessor.optionControls ?? [];
    const flagKeys = controls.filter((c) => c.key.startsWith('flag_')).map((c) => c.key);
    expect(flagKeys).toContain('flag_g');
    expect(flagKeys).toContain('flag_i');
    expect(flagKeys).toContain('flag_m');
    expect(flagKeys.length).toBe(6);
  });

  it('returns error when test string exceeds max length', () => {
    const huge = 'a'.repeat(60_000);
    const r = run('a', huge);
    expect(r.error).toBeDefined();
    expect(r.error).toContain('too long');
  });
});

// ============================================================
// SQL Formatter
// ============================================================

describe('sqlFormatterProcessor', () => {
  function run(sql: string, opts?: Record<string, string>) {
    return sqlFormatterProcessor.process({ value: sql, options: { dialect: 'sql', tabWidth: '2', keywordCase: 'upper', ...opts } });
  }

  it('returns error for empty input', () => {
    const r = run('');
    expect(r.error).toBeDefined();
  });

  it('formats a simple SELECT', () => {
    const r = run('SELECT id,name FROM users');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('SELECT');
    expect(r.output?.value).toContain('FROM');
  });

  it('uppercases keywords by default', () => {
    const r = run('select id from users');
    expect(r.output?.value).toContain('SELECT');
    expect(r.output?.value).toContain('FROM');
  });

  it('lowercases keywords when option set', () => {
    const r = run('SELECT id FROM users', { keywordCase: 'lower' });
    expect(r.output?.value).toContain('select');
    expect(r.output?.value).toContain('from');
  });

  it('formats SELECT with JOIN', () => {
    const sql = 'SELECT u.id,u.name FROM users u JOIN orders o ON u.id=o.user_id';
    const r = run(sql);
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('JOIN');
    expect(r.output?.value).toContain('ON');
  });

  it('formats SELECT with WHERE', () => {
    const r = run('SELECT id FROM users WHERE active=1');
    expect(r.output?.value).toContain('WHERE');
  });

  it('formats SELECT with GROUP BY', () => {
    const r = run('SELECT category, COUNT(*) FROM products GROUP BY category');
    expect(r.output?.value).toContain('GROUP BY');
  });

  it('formats SELECT with ORDER BY', () => {
    const r = run('SELECT id, name FROM users ORDER BY name ASC');
    expect(r.output?.value).toContain('ORDER BY');
  });

  it('formats INSERT', () => {
    const r = run("INSERT INTO users (name, email) VALUES ('John', 'john@example.com')");
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('INSERT');
  });

  it('formats UPDATE', () => {
    const r = run("UPDATE users SET name='Jane' WHERE id=1");
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('UPDATE');
  });

  it('formats DELETE', () => {
    const r = run('DELETE FROM users WHERE id=1');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('DELETE');
  });

  it('formats CASE expression', () => {
    const r = run("SELECT id, CASE WHEN active=1 THEN 'yes' ELSE 'no' END AS is_active FROM users");
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('CASE');
  });

  it('uses 4-space indent when tabWidth=4', () => {
    const r = run('SELECT id FROM users', { tabWidth: '4' });
    expect(r.error).toBeUndefined();
    // The output should have indentation
    expect(r.output?.value).toBeDefined();
  });

  it('output is copyable', () => {
    const r = run('SELECT 1');
    expect(r.output?.copyable).toBe(true);
  });

  it('output has downloadFilename formatted.sql', () => {
    const r = run('SELECT 1');
    expect(r.output?.downloadFilename).toBe('formatted.sql');
  });

  it('meta includes dialect', () => {
    const r = run('SELECT 1');
    expect(r.meta?.dialect).toBeDefined();
  });

  it('formats complex query from spec', () => {
    const sql = 'SELECT u.id,u.name,o.total FROM users u JOIN orders o ON u.id=o.user_id WHERE o.total>100 ORDER BY o.total DESC;';
    const r = run(sql);
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('SELECT');
    expect(r.output?.value).toContain('JOIN');
    expect(r.output?.value).toContain('WHERE');
    expect(r.output?.value).toContain('ORDER BY');
  });

  it('has optionControls for dialect, indent, keywords', () => {
    const controls = sqlFormatterProcessor.optionControls ?? [];
    const keys = controls.map((c) => c.key);
    expect(keys).toContain('dialect');
    expect(keys).toContain('tabWidth');
    expect(keys).toContain('keywordCase');
  });

  it('has example input', () => {
    expect(sqlFormatterProcessor.exampleInput).toBeDefined();
    expect(sqlFormatterProcessor.exampleInput!.length).toBeGreaterThan(10);
  });
});

// ============================================================
// XML Formatter
// ============================================================

describe('xmlFormatterProcessor', () => {
  function run(xml: string, opts?: Record<string, string>) {
    return xmlFormatterProcessor.process({ value: xml, options: { tabWidth: '2', ...opts } });
  }

  it('returns error for empty input', () => {
    const r = run('');
    expect(r.error).toBeDefined();
  });

  it('formats simple nested XML', () => {
    const r = run('<root><child>hello</child></root>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('<root>');
    expect(r.output?.value).toContain('<child>hello</child>');
    expect(r.output?.value).toContain('</root>');
  });

  it('formats XML with attributes', () => {
    const r = run('<user id="1" name="John"/>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('id="1"');
  });

  it('formats XML from spec example', () => {
    const xml = '<users><user id="1"><name>John</name></user><user id="2"><name>Jane</name></user></users>';
    const r = run(xml);
    expect(r.error).toBeUndefined();
    // Indented structure
    expect(r.output?.value.split('\n').length).toBeGreaterThan(3);
    expect(r.output?.value).toContain('<users>');
    expect(r.output?.value).toContain('<user id="1">');
    expect(r.output?.value).toContain('</users>');
  });

  it('reports error for malformed XML (undefined entity)', () => {
    const r = run('<root>&invalid_entity;</root>');
    expect(r.error).toBeDefined();
    expect(r.error).toContain('Invalid XML');
  });

  it('reports error for bare text (not XML)', () => {
    const r = run('not xml at all just plain text here');
    expect(r.error).toBeDefined();
  });

  it('preserves XML comments', () => {
    const r = run('<root><!-- a comment --><child/></root>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('<!-- a comment -->');
  });

  it('preserves CDATA sections', () => {
    const r = run('<root><child><![CDATA[<not markup>]]></child></root>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('<![CDATA[');
  });

  it('uses 4-space indent when option set', () => {
    const r = run('<root><child/></root>', { tabWidth: '4' });
    expect(r.error).toBeUndefined();
    // Should have 4-space indentation
    expect(r.output?.value).toContain('    <child');
  });

  it('handles self-closing elements', () => {
    const r = run('<root><br/><hr/></root>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('<br/>');
  });

  it('handles Unicode text content', () => {
    const r = run('<root><name>こんにちは</name></root>');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('こんにちは');
  });

  it('output is copyable', () => {
    const r = run('<root/>');
    expect(r.output?.copyable).toBe(true);
  });

  it('output downloadFilename is formatted.xml', () => {
    const r = run('<root/>');
    expect(r.output?.downloadFilename).toBe('formatted.xml');
  });

  it('has example input', () => {
    expect(xmlFormatterProcessor.exampleInput).toBeDefined();
  });

  it('has optionControls for tabWidth', () => {
    const controls = xmlFormatterProcessor.optionControls ?? [];
    expect(controls.some((c) => c.key === 'tabWidth')).toBe(true);
  });
});

// ============================================================
// YAML Formatter
// ============================================================

describe('yamlFormatterProcessor', () => {
  function run(input: string, opts?: Record<string, unknown>) {
    return yamlFormatterProcessor.process({ value: input, options: { indent: '2', ...opts } });
  }

  it('returns error for empty input', () => {
    const r = run('');
    expect(r.error).toBeDefined();
  });

  it('formats a simple mapping', () => {
    const r = run('name: test\nversion: 1');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('name: test');
    expect(r.output?.value).toContain('version: 1');
  });

  it('formats a sequence', () => {
    const r = run('tools:\n- json\n- yaml');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('tools:');
    expect(r.output?.value).toContain('- json');
  });

  it('formats nested structures', () => {
    const r = run('a:\n  b:\n    c: deep');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('a:');
    expect(r.output?.value).toContain('b:');
    expect(r.output?.value).toContain('c: deep');
  });

  it('handles booleans', () => {
    const r = run('enabled: true\ndisabled: false');
    expect(r.error).toBeUndefined();
  });

  it('handles numbers', () => {
    const r = run('count: 42\npi: 3.14');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('count: 42');
  });

  it('handles null', () => {
    const r = run('value: null');
    expect(r.error).toBeUndefined();
  });

  it('handles Unicode strings', () => {
    const r = run('greeting: こんにちは');
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('こんにちは');
  });

  it('returns error for invalid YAML', () => {
    const r = run('key: : invalid');
    expect(r.error).toBeDefined();
    expect(r.error).toContain('Invalid YAML');
  });

  it('reports line number in error', () => {
    const r = run('good: line\nkey: : bad');
    expect(r.error).toBeDefined();
    // Error should mention line
    expect(r.error).toContain('line');
  });

  it('sorts keys when option enabled', () => {
    const r = run('z: last\na: first', { sortKeys: true });
    expect(r.error).toBeUndefined();
    const val = r.output!.value;
    expect(val.indexOf('a:')).toBeLessThan(val.indexOf('z:'));
  });

  it('output is copyable', () => {
    const r = run('key: value');
    expect(r.output?.copyable).toBe(true);
  });

  it('downloadFilename is formatted.yaml', () => {
    const r = run('key: value');
    expect(r.output?.downloadFilename).toBe('formatted.yaml');
  });

  it('has example input', () => {
    expect(yamlFormatterProcessor.exampleInput).toBeDefined();
  });

  it('has optionControls', () => {
    const controls = yamlFormatterProcessor.optionControls ?? [];
    expect(controls.length).toBeGreaterThan(0);
  });
});

// ============================================================
// YAML to JSON Converter
// ============================================================

describe('yamlToJsonProcessor', () => {
  function run(input: string, opts?: Record<string, unknown>) {
    return yamlToJsonProcessor.process({ value: input, options: { indent: '2', ...opts } });
  }

  it('returns error for empty input', () => {
    const r = run('');
    expect(r.error).toBeDefined();
  });

  it('converts a simple mapping to JSON', () => {
    const r = run('name: test\nversion: 1');
    expect(r.error).toBeUndefined();
    const json = JSON.parse(r.output!.value);
    expect(json.name).toBe('test');
    expect(json.version).toBe(1);
  });

  it('converts nested mapping', () => {
    const r = run('a:\n  b:\n    c: deep');
    const json = JSON.parse(r.output!.value);
    expect(json.a.b.c).toBe('deep');
  });

  it('converts arrays', () => {
    const r = run('tools:\n  - json\n  - yaml');
    const json = JSON.parse(r.output!.value);
    expect(json.tools).toEqual(['json', 'yaml']);
  });

  it('preserves booleans', () => {
    const r = run('enabled: true\ndisabled: false');
    const json = JSON.parse(r.output!.value);
    expect(json.enabled).toBe(true);
    expect(json.disabled).toBe(false);
  });

  it('preserves numbers', () => {
    const r = run('count: 42\npi: 3.14');
    const json = JSON.parse(r.output!.value);
    expect(json.count).toBe(42);
    expect(json.pi).toBe(3.14);
  });

  it('preserves null', () => {
    const r = run('value: null');
    const json = JSON.parse(r.output!.value);
    expect(json.value).toBeNull();
  });

  it('preserves Unicode strings', () => {
    const r = run('greeting: こんにちは');
    const json = JSON.parse(r.output!.value);
    expect(json.greeting).toBe('こんにちは');
  });

  it('formats with 2-space indent by default', () => {
    const r = run('a: 1');
    expect(r.output?.value).toContain('  ');
  });

  it('formats with 4-space indent when option set', () => {
    const r = run('a:\n  b: 1', { indent: '4' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toBeDefined();
  });

  it('produces compact JSON when indent=0', () => {
    const r = run('a: 1\nb: 2', { indent: '0' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).not.toContain('\n');
  });

  it('returns error for invalid YAML', () => {
    const r = run('key: : invalid');
    expect(r.error).toBeDefined();
    expect(r.error).toContain('Invalid YAML');
  });

  it('output type is json', () => {
    const r = run('name: test');
    expect(r.output?.type).toBe('json');
  });

  it('output is copyable', () => {
    const r = run('a: 1');
    expect(r.output?.copyable).toBe(true);
  });

  it('downloadFilename is output.json', () => {
    const r = run('a: 1');
    expect(r.output?.downloadFilename).toBe('output.json');
  });

  it('has example input defined', () => {
    expect(yamlToJsonProcessor.exampleInput).toBeDefined();
  });

  it('round-trip: YAML → JSON → valid JSON', () => {
    const yamlInput = `name: DevToolsHub\nversion: 1\ntools:\n  - json\n  - yaml\nsettings:\n  enabled: true\n  debug: false`;
    const r = run(yamlInput);
    expect(r.error).toBeUndefined();
    // Must be valid JSON
    expect(() => JSON.parse(r.output!.value)).not.toThrow();
    const parsed = JSON.parse(r.output!.value);
    expect(parsed.name).toBe('DevToolsHub');
    expect(parsed.tools).toEqual(['json', 'yaml']);
  });

  it('has optionControls for indent', () => {
    const controls = yamlToJsonProcessor.optionControls ?? [];
    expect(controls.some((c) => c.key === 'indent')).toBe(true);
  });
});

// ============================================================
// Registry integrity — M6 tools
// ============================================================

describe('M6 registry entries', () => {
  const m6Ids = ['regex-tester', 'sql-formatter', 'xml-formatter', 'yaml-formatter', 'yaml-to-json'];
  const categoryCounts: Record<string, string[]> = {
    regex: ['regex-tester'],
    sql: ['sql-formatter'],
    xml: ['xml-formatter'],
    yaml: ['yaml-formatter', 'yaml-to-json'],
  };

  m6Ids.forEach((id) => {
    it(`${id} exists in registry`, () => {
      expect(getToolById(id)).toBeDefined();
    });

    it(`${id} is enabled`, () => {
      expect(getToolById(id)?.enabled).toBe(true);
    });

    it(`${id} has seoTitle`, () => {
      expect(getToolById(id)?.seoTitle.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has seoDescription`, () => {
      expect(getToolById(id)?.seoDescription.trim().length).toBeGreaterThan(0);
    });

    it(`${id} has a processor`, () => {
      expect(getProcessor(id)).toBeDefined();
    });
  });

  Object.entries(categoryCounts).forEach(([catId, expectedIds]) => {
    it(`category '${catId}' exists`, () => {
      const cats = CATEGORIES.map((c) => c.id);
      expect(cats).toContain(catId);
    });

    it(`getToolsByCategory('${catId}') returns correct tools`, () => {
      const tools = getToolsByCategory(catId);
      const ids = tools.map((t) => t.id);
      expectedIds.forEach((id) => expect(ids).toContain(id));
    });
  });

  it('regex-tester is in the regex category (not data-code)', () => {
    expect(getToolById('regex-tester')?.category).toBe('regex');
  });

  it('all M6 relatedTools IDs exist in registry', () => {
    m6Ids.forEach((id) => {
      const tool = getToolById(id);
      tool?.relatedTools?.forEach((rid) => {
        expect(getToolById(rid)).toBeDefined();
      });
    });
  });

  it('yaml-formatter relatedTools includes yaml-to-json', () => {
    expect(getToolById('yaml-formatter')?.relatedTools).toContain('yaml-to-json');
  });

  it('yaml-to-json relatedTools includes yaml-formatter', () => {
    expect(getToolById('yaml-to-json')?.relatedTools).toContain('yaml-formatter');
  });
});
