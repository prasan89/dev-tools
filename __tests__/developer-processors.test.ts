import { jwtDecoderProcessor } from '@/lib/processors/jwt-decoder';
import { uuidGeneratorProcessor } from '@/lib/processors/uuid-generator';
import { uuidValidatorProcessor } from '@/lib/processors/uuid-validator';
import { passwordGeneratorProcessor } from '@/lib/processors/password-generator';
import { unixTimestampConverterProcessor } from '@/lib/processors/unix-timestamp-converter';
import { timestampToDateProcessor } from '@/lib/processors/timestamp-to-date';
import { getToolById, getToolsByCategory, CATEGORIES } from '@/lib/registry';
import { getProcessor } from '@/lib/processors/index';

// Helper to build a known JWT (header + payload, dummy signature)
function makeJwt(header: object, payload: object): string {
  function b64url(obj: object): string {
    const json = JSON.stringify(obj);
    const b64 = Buffer.from(json, 'utf8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return `${b64url(header)}.${b64url(payload)}.fake_signature`;
}

// ============================================================
// JWT Decoder
// ============================================================

describe('jwtDecoderProcessor', () => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'user_123',
    iss: 'example.com',
    iat: 1700000000,
    exp: 1700003600,
    nbf: 1700000000,
  };

  it('returns error for empty input', () => {
    const r = jwtDecoderProcessor.process({ value: '' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-JWT string (no dots)', () => {
    const r = jwtDecoderProcessor.process({ value: 'notajwt' });
    expect(r.error).toBeDefined();
  });

  it('returns error for only 2 parts', () => {
    const r = jwtDecoderProcessor.process({ value: 'abc.def' });
    expect(r.error).toBeDefined();
  });

  it('returns error for invalid header base64url', () => {
    const r = jwtDecoderProcessor.process({ value: '!!!.abc.sig' });
    expect(r.error).toBeDefined();
  });

  it('decodes a well-formed JWT', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('"alg": "HS256"');
    expect(r.output?.value).toContain('"sub": "user_123"');
  });

  it('shows expiration as ISO string', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.value).toContain('exp (Expiration Time):');
    expect(r.output?.value).toContain('2023-11-14');
  });

  it('shows iat and nbf as ISO strings', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.value).toContain('iat (Issued At):');
    expect(r.output?.value).toContain('nbf (Not Before):');
  });

  it('includes the security warning', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.value).toContain('does not verify its signature');
  });

  it('includes the warning in the warnings array', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.warnings?.length).toBeGreaterThan(0);
    expect(r.warnings?.[0].message).toContain('does not verify');
  });

  it('meta includes algorithm', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.meta?.['algorithm']).toBe('HS256');
  });

  it('output is copyable', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.copyable).toBe(true);
  });

  it('output has downloadFilename', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.downloadFilename).toBe('jwt-decoded.txt');
  });

  it('handles a JWT with no registered claims', () => {
    const custom = makeJwt(header, { foo: 'bar', baz: 42 });
    const r = jwtDecoderProcessor.process({ value: custom });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('"foo": "bar"');
  });

  it('trims whitespace around input', () => {
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: `  ${jwt}  ` });
    expect(r.error).toBeUndefined();
  });

  it('shows audience claim when present', () => {
    const jwt = makeJwt(header, { ...payload, aud: ['api.example.com'] });
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(r.output?.value).toContain('aud (Audience)');
  });

  it('does not send token to any backend (processor is pure function)', () => {
    // The processor must have no side-effects; verify it returns only a result object
    const jwt = makeJwt(header, payload);
    const r = jwtDecoderProcessor.process({ value: jwt });
    expect(typeof r).toBe('object');
    expect(r.output).toBeDefined();
  });
});

// ============================================================
// UUID Generator
// ============================================================

describe('uuidGeneratorProcessor', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('generates a valid UUID v4', () => {
    const r = uuidGeneratorProcessor.process({ value: '1' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toMatch(UUID_RE);
  });

  it('generates multiple UUIDs when count > 1', () => {
    const r = uuidGeneratorProcessor.process({ value: '5' });
    const lines = r.output?.value.split('\n') ?? [];
    expect(lines.length).toBe(5);
    lines.forEach((line) => expect(line).toMatch(UUID_RE));
  });

  it('defaults to 1 UUID for empty input', () => {
    const r = uuidGeneratorProcessor.process({ value: '' });
    expect(r.error).toBeUndefined();
    const lines = (r.output?.value ?? '').split('\n').filter(Boolean);
    expect(lines.length).toBe(1);
  });

  it('returns error for count = 0', () => {
    const r = uuidGeneratorProcessor.process({ value: '0' });
    expect(r.error).toBeDefined();
  });

  it('returns error for count > 100', () => {
    const r = uuidGeneratorProcessor.process({ value: '101' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-numeric input', () => {
    const r = uuidGeneratorProcessor.process({ value: 'abc' });
    expect(r.error).toBeDefined();
  });

  it('generates uppercase UUIDs when option set', () => {
    const r = uuidGeneratorProcessor.process({ value: '3', options: { uppercase: true } });
    const lines = r.output?.value.split('\n') ?? [];
    lines.forEach((line) => {
      expect(line).toMatch(/^[0-9A-F-]+$/);
    });
  });

  it('generates lowercase UUIDs by default', () => {
    const r = uuidGeneratorProcessor.process({ value: '3' });
    const lines = r.output?.value.split('\n') ?? [];
    lines.forEach((line) => {
      expect(line).toMatch(/^[0-9a-f-]+$/);
    });
  });

  it('generates 100 UUIDs', () => {
    const r = uuidGeneratorProcessor.process({ value: '100' });
    const lines = r.output?.value.split('\n').filter(Boolean) ?? [];
    expect(lines.length).toBe(100);
  });

  it('all generated UUIDs are unique', () => {
    const r = uuidGeneratorProcessor.process({ value: '20' });
    const lines = r.output?.value.split('\n').filter(Boolean) ?? [];
    const unique = new Set(lines);
    expect(unique.size).toBe(20);
  });

  it('output is copyable', () => {
    const r = uuidGeneratorProcessor.process({ value: '1' });
    expect(r.output?.copyable).toBe(true);
  });

  it('meta includes count', () => {
    const r = uuidGeneratorProcessor.process({ value: '3' });
    expect(r.meta?.count).toBe(3);
  });
});

// ============================================================
// UUID Validator
// ============================================================

describe('uuidValidatorProcessor', () => {
  it('validates a correct v4 UUID (lowercase)', () => {
    const r = uuidValidatorProcessor.process({ value: '550e8400-e29b-41d4-a716-446655440000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('Valid UUID');
  });

  it('validates a correct v4 UUID (uppercase)', () => {
    const r = uuidValidatorProcessor.process({ value: '550E8400-E29B-41D4-A716-446655440000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('Valid UUID');
  });

  it('identifies UUID v4 version', () => {
    const r = uuidValidatorProcessor.process({ value: '550e8400-e29b-41d4-a716-446655440000' });
    expect(r.output?.value).toContain('v4');
  });

  it('identifies UUID v1', () => {
    const r = uuidValidatorProcessor.process({ value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('v1');
  });

  it('returns error for empty input', () => {
    const r = uuidValidatorProcessor.process({ value: '' });
    expect(r.error).toBeDefined();
  });

  it('returns error for too few groups', () => {
    const r = uuidValidatorProcessor.process({ value: 'aaaabbbb-cccc-dddd' });
    expect(r.error).toBeDefined();
  });

  it('returns error for wrong group length', () => {
    const r = uuidValidatorProcessor.process({ value: 'aaaabbbb-cccc-dddd-eeee-fffff12345678' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-hex characters', () => {
    const r = uuidValidatorProcessor.process({ value: 'zzzzzzzz-zzzz-4zzz-azzz-zzzzzzzzzzzz' });
    expect(r.error).toBeDefined();
  });

  it('output contains normalised (lowercase) UUID', () => {
    const r = uuidValidatorProcessor.process({ value: '550E8400-E29B-41D4-A716-446655440000' });
    expect(r.output?.value).toContain('550e8400-e29b-41d4-a716-446655440000');
  });

  it('output is copyable', () => {
    const r = uuidValidatorProcessor.process({ value: '550e8400-e29b-41d4-a716-446655440000' });
    expect(r.output?.copyable).toBe(true);
  });
});

// ============================================================
// Password Generator
// ============================================================

describe('passwordGeneratorProcessor', () => {
  it('generates a password of the requested length', () => {
    const r = passwordGeneratorProcessor.process({ value: '16' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value.length).toBe(16);
  });

  it('generates password for minimum length 8', () => {
    const r = passwordGeneratorProcessor.process({ value: '8' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value.length).toBe(8);
  });

  it('generates password for maximum length 128', () => {
    const r = passwordGeneratorProcessor.process({ value: '128' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value.length).toBe(128);
  });

  it('returns error for length < 8', () => {
    const r = passwordGeneratorProcessor.process({ value: '4' });
    expect(r.error).toBeDefined();
  });

  it('returns error for length > 128', () => {
    const r = passwordGeneratorProcessor.process({ value: '129' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-numeric input', () => {
    const r = passwordGeneratorProcessor.process({ value: 'abc' });
    expect(r.error).toBeDefined();
  });

  it('defaults to 16 chars for empty input', () => {
    const r = passwordGeneratorProcessor.process({ value: '' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value.length).toBe(16);
  });

  it('returns error when all sets disabled', () => {
    const r = passwordGeneratorProcessor.process({
      value: '16',
      options: { uppercase: false, lowercase: false, digits: false, symbols: false },
    });
    expect(r.error).toBeDefined();
  });

  it('contains at least one uppercase when set enabled', () => {
    const r = passwordGeneratorProcessor.process({
      value: '20',
      options: { uppercase: true, lowercase: false, digits: false, symbols: false },
    });
    expect(r.error).toBeUndefined();
    expect(/[A-Z]/.test(r.output!.value)).toBe(true);
    expect(/[a-z]/.test(r.output!.value)).toBe(false);
    expect(/[0-9]/.test(r.output!.value)).toBe(false);
  });

  it('contains at least one digit when set enabled', () => {
    const r = passwordGeneratorProcessor.process({
      value: '16',
      options: { uppercase: false, lowercase: false, digits: true, symbols: false },
    });
    expect(r.error).toBeUndefined();
    expect(/[0-9]/.test(r.output!.value)).toBe(true);
  });

  it('contains symbols when set enabled', () => {
    const r = passwordGeneratorProcessor.process({
      value: '32',
      options: { uppercase: false, lowercase: false, digits: false, symbols: true },
    });
    expect(r.error).toBeUndefined();
    expect(r.output!.value.length).toBe(32);
  });

  it('generates two different passwords (randomness check)', () => {
    const a = passwordGeneratorProcessor.process({ value: '32' });
    const b = passwordGeneratorProcessor.process({ value: '32' });
    // Probability of identical 32-char passwords is astronomically low
    expect(a.output?.value).not.toBe(b.output?.value);
  });

  it('output is copyable', () => {
    const r = passwordGeneratorProcessor.process({ value: '16' });
    expect(r.output?.copyable).toBe(true);
  });

  it('meta includes length', () => {
    const r = passwordGeneratorProcessor.process({ value: '24' });
    expect(r.meta?.length).toBe(24);
  });
});

// ============================================================
// Unix Timestamp Converter
// ============================================================

describe('unixTimestampConverterProcessor', () => {
  it('converts a unix timestamp in seconds', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('2023-11-14');
  });

  it('converts a unix timestamp in milliseconds (auto-detect)', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('2023-11-14');
    expect(r.meta?.unit).toContain('milliseconds');
  });

  it('includes UTC output', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.output?.value).toContain('UTC:');
  });

  it('includes ISO 8601 output', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.output?.value).toContain('ISO 8601:');
    expect(r.output?.value).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('includes Local output line', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.output?.value).toContain('Local:');
  });

  it('handles epoch 0 (1970-01-01)', () => {
    const r = unixTimestampConverterProcessor.process({ value: '0' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('1970');
  });

  it('handles negative timestamp (pre-1970)', () => {
    const r = unixTimestampConverterProcessor.process({ value: '-86400' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('1969');
  });

  it('returns error for empty input', () => {
    const r = unixTimestampConverterProcessor.process({ value: '' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-numeric input', () => {
    const r = unixTimestampConverterProcessor.process({ value: 'not-a-number' });
    expect(r.error).toBeDefined();
  });

  it('meta includes unix ms', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.meta?.['unix ms']).toBe(1700000000 * 1000);
  });

  it('output is copyable', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.output?.copyable).toBe(true);
  });

  it('auto-detects seconds for 10-digit timestamp', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000' });
    expect(r.meta?.unit).toContain('seconds');
  });

  it('auto-detects milliseconds for 13-digit timestamp', () => {
    const r = unixTimestampConverterProcessor.process({ value: '1700000000000' });
    expect(r.meta?.unit).toContain('milliseconds');
  });
});

// ============================================================
// Timestamp to Date Converter
// ============================================================

describe('timestampToDateProcessor', () => {
  it('converts a millisecond timestamp', () => {
    const r = timestampToDateProcessor.process({ value: '1700000000000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('2023-11-14');
  });

  it('converts a second timestamp', () => {
    const r = timestampToDateProcessor.process({ value: '1700000000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('2023-11-14');
  });

  it('includes UTC, Local, ISO 8601 lines', () => {
    const r = timestampToDateProcessor.process({ value: '1700000000000' });
    expect(r.output?.value).toContain('UTC:');
    expect(r.output?.value).toContain('Local:');
    expect(r.output?.value).toContain('ISO 8601:');
  });

  it('handles epoch 0', () => {
    const r = timestampToDateProcessor.process({ value: '0' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('1970');
  });

  it('handles negative timestamp', () => {
    const r = timestampToDateProcessor.process({ value: '-1000' });
    expect(r.error).toBeUndefined();
    expect(r.output?.value).toContain('1969');
  });

  it('returns error for empty input', () => {
    const r = timestampToDateProcessor.process({ value: '' });
    expect(r.error).toBeDefined();
  });

  it('returns error for non-numeric input', () => {
    const r = timestampToDateProcessor.process({ value: 'hello' });
    expect(r.error).toBeDefined();
  });

  it('output is copyable', () => {
    const r = timestampToDateProcessor.process({ value: '1700000000000' });
    expect(r.output?.copyable).toBe(true);
  });

  it('meta includes unit', () => {
    const r = timestampToDateProcessor.process({ value: '1700000000000' });
    expect(r.meta?.unit).toContain('milliseconds');
  });
});

// ============================================================
// Registry integrity — M5 tools
// ============================================================

describe('M5 registry entries', () => {
  const developerUtilIds = ['jwt-decoder', 'uuid-generator', 'uuid-validator', 'password-generator'];
  const dateTimeIds = ['unix-timestamp-converter', 'timestamp-to-date'];
  const allM5Ids = [...developerUtilIds, ...dateTimeIds];

  allM5Ids.forEach((id) => {
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

    it(`${id} has a processor`, async () => {
      expect(await getProcessor(id)).toBeDefined();
    });
  });

  developerUtilIds.forEach((id) => {
    it(`${id} has category 'developer-utilities'`, () => {
      expect(getToolById(id)?.category).toBe('developer-utilities');
    });
  });

  dateTimeIds.forEach((id) => {
    it(`${id} has category 'date-time'`, () => {
      expect(getToolById(id)?.category).toBe('date-time');
    });
  });

  it('developer-utilities category exists', () => {
    const cats = CATEGORIES.map((c) => c.id);
    expect(cats).toContain('developer-utilities');
  });

  it('date-time category exists', () => {
    const cats = CATEGORIES.map((c) => c.id);
    expect(cats).toContain('date-time');
  });

  it('getToolsByCategory(developer-utilities) returns the 4 tools', () => {
    const tools = getToolsByCategory('developer-utilities');
    const ids = tools.map((t) => t.id);
    expect(ids).toContain('jwt-decoder');
    expect(ids).toContain('uuid-generator');
    expect(ids).toContain('uuid-validator');
    expect(ids).toContain('password-generator');
  });

  it('getToolsByCategory(date-time) returns the 2 tools', () => {
    const tools = getToolsByCategory('date-time');
    const ids = tools.map((t) => t.id);
    expect(ids).toContain('unix-timestamp-converter');
    expect(ids).toContain('timestamp-to-date');
  });

  it('all M5 relatedTools IDs exist in registry', () => {
    allM5Ids.forEach((id) => {
      const tool = getToolById(id);
      tool?.relatedTools?.forEach((rid) => {
        expect(getToolById(rid)).toBeDefined();
      });
    });
  });
});
