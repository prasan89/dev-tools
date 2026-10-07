import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

function byteLength(str: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return Buffer.byteLength(str, 'utf8');
}

interface SizeStats {
  totalKeys: number;
  objectCount: number;
  arrayCount: number;
  stringValues: number;
  numberValues: number;
  booleanValues: number;
  nullValues: number;
  maxDepth: number;
  keyPaths: Array<{ path: string; bytes: number }>;
}

function analyzeValue(
  val: unknown,
  path: string,
  depth: number,
  stats: SizeStats,
): void {
  if (val === null) {
    stats.nullValues++;
    return;
  }
  if (typeof val === 'string') {
    stats.stringValues++;
    return;
  }
  if (typeof val === 'number') {
    stats.numberValues++;
    return;
  }
  if (typeof val === 'boolean') {
    stats.booleanValues++;
    return;
  }
  if (Array.isArray(val)) {
    stats.arrayCount++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    for (let i = 0; i < val.length; i++) {
      analyzeValue(val[i], `${path}[${i}]`, depth + 1, stats);
    }
    return;
  }
  if (typeof val === 'object') {
    stats.objectCount++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    const obj = val as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      stats.totalKeys++;
      const childPath = path ? `${path}.${key}` : key;
      const childJson = JSON.stringify(obj[key]);
      const childBytes = byteLength(childJson ?? 'null');
      stats.keyPaths.push({ path: childPath, bytes: childBytes });
      analyzeValue(obj[key], childPath, depth + 1, stats);
    }
  }
}

function formatBytes(bytes: number): string {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  return `${bytes.toLocaleString()} bytes / ${kb.toFixed(2)} KB / ${mb.toFixed(4)} MB`;
}

export const jsonSizeAnalyzerProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste JSON here to analyze its size and structure...',
  autoProcess: true,
  exampleInput: JSON.stringify(
    {
      user: {
        id: 'u-8842',
        name: 'Alice Nguyen',
        email: 'alice@example.com',
        age: 32,
        verified: true,
        role: 'admin',
        address: {
          street: '123 Maple St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
          country: 'US',
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          timezone: 'America/Chicago',
        },
        tags: ['developer', 'admin', 'beta-tester'],
        scores: [98, 87, 91, 76, 84],
        metadata: {
          createdAt: '2023-03-15T08:22:00Z',
          lastLogin: '2026-10-07T14:10:00Z',
          loginCount: 214,
          plan: 'pro',
          referrer: null,
          twoFactorEnabled: false,
          apiKeys: [
            { key: 'ak_prod_abc123', label: 'Production', active: true },
            { key: 'ak_dev_xyz789', label: 'Development', active: false },
          ],
        },
      },
    },
    null,
    2,
  ),

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to analyze.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const inputBytes = byteLength(raw);
    const chars = raw.length;

    const stats: SizeStats = {
      totalKeys: 0,
      objectCount: 0,
      arrayCount: 0,
      stringValues: 0,
      numberValues: 0,
      booleanValues: 0,
      nullValues: 0,
      maxDepth: 0,
      keyPaths: [],
    };

    analyzeValue(parsed, '', 0, stats);

    // Top 5 largest keys by serialized byte size
    const top5 = [...stats.keyPaths]
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5);

    const top5Lines =
      top5.length > 0
        ? top5
            .map(({ path, bytes }) => {
              const pct = inputBytes > 0 ? ((bytes / inputBytes) * 100).toFixed(1) : '0.0';
              return `  "${path}" — ${bytes.toLocaleString()} bytes (${pct}%)`;
            })
            .join('\n')
        : '  (no keyed values found)';

    const report = [
      '=== JSON Size Analysis ===',
      `File size: ${formatBytes(inputBytes)}`,
      `Characters: ${chars.toLocaleString()}`,
      '',
      '=== Structure ===',
      `Total keys: ${stats.totalKeys.toLocaleString()}`,
      `Object count: ${stats.objectCount.toLocaleString()}`,
      `Array count: ${stats.arrayCount.toLocaleString()}`,
      `String values: ${stats.stringValues.toLocaleString()}`,
      `Number values: ${stats.numberValues.toLocaleString()}`,
      `Boolean values: ${stats.booleanValues.toLocaleString()}`,
      `Null values: ${stats.nullValues.toLocaleString()}`,
      `Maximum nesting depth: ${stats.maxDepth}`,
      '',
      '=== Top 5 Largest Keys ===',
      top5Lines,
    ].join('\n');

    return {
      output: {
        value: report,
        type: 'text',
        label: 'Size Analysis Report',
        copyable: true,
      },
      meta: {
        bytes: inputBytes,
        keys: stats.totalKeys,
        depth: stats.maxDepth,
        objects: stats.objectCount,
        arrays: stats.arrayCount,
      },
    };
  },
};
