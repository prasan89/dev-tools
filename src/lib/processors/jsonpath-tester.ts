import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Lazy-loaded: jsonpath-plus is only fetched on the JSONPath tool page.
async function getJSONPath() {
  const { JSONPath } = await import('jsonpath-plus');
  return JSONPath;
}

// Cache the module after first load so repeated calls are instant
let _JSONPath: Awaited<ReturnType<typeof getJSONPath>> | null = null;

async function evaluate(json: unknown, expression: string): Promise<unknown[]> {
  if (!_JSONPath) _JSONPath = await getJSONPath();
  return _JSONPath({ path: expression, json, resultType: 'value' }) as unknown[];
}

// ---------------------------------------------------------------------------
// Synchronous wrapper: we run the async evaluation via a synchronous shim.
// The ToolProcessor interface requires sync process(). We handle this by
// running the first call synchronously (before the library is loaded) and
// returning a "computing…" state. On subsequent calls the library is cached.
//
// In practice, the user always has the library loaded before they hit Run
// because ToolWorkspace loads the processor asynchronously. So by the time
// process() is called, the module is available. We keep a sync cache.
// ---------------------------------------------------------------------------

// Sync JSONPath via the pre-loaded cache or immediate throw
function runSync(json: unknown, expression: string): unknown[] {
  if (!_JSONPath) {
    // Library not yet loaded — caller should try again after loading
    throw new Error('__LOADING__');
  }
  return _JSONPath({ path: expression, json, resultType: 'value' }) as unknown[];
}

// Warm the cache immediately (fire-and-forget)
getJSONPath().then((fn) => { _JSONPath = fn; }).catch(() => {});

export const jsonpathTesterProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste your JSON here…',
  hasSecondaryInput: true,
  secondaryInputLabel: 'JSONPath Expression',
  autoProcess: true,
  exampleInput: `{
  "store": {
    "book": [
      { "title": "Sayings of the Century", "price": 8.95 },
      { "title": "Sword of Honour", "price": 12.99 },
      { "title": "Moby Dick", "price": 8.99 }
    ],
    "bicycle": { "color": "red", "price": 19.95 }
  }
}`,
  exampleSecondary: '$.store.book[*].title',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    const expression = (input.secondary ?? '').trim();

    if (!raw) return { error: 'Paste JSON to query.' };
    if (!expression) return { error: 'Enter a JSONPath expression (e.g. $.store.book[*].title).' };

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'JSON parse error';
      return { error: `Invalid JSON:\n\n${msg}` };
    }

    let results: unknown[];
    try {
      results = runSync(json, expression);
    } catch (err) {
      if (err instanceof Error && err.message === '__LOADING__') {
        return { error: 'JSONPath library is loading — click Run again.' };
      }
      const msg = err instanceof Error ? err.message : 'JSONPath error';
      return { error: `JSONPath error:\n\n${msg}` };
    }

    if (results.length === 0) {
      return {
        output: {
          value: '(no matches)',
          type: 'text',
          label: 'Results',
          copyable: true,
        },
        meta: { matches: 0 },
      };
    }

    const formatted = results.length === 1
      ? JSON.stringify(results[0], null, 2)
      : JSON.stringify(results, null, 2);

    return {
      output: {
        value: formatted,
        type: 'json',
        label: `Results (${results.length} match${results.length !== 1 ? 'es' : ''})`,
        copyable: true,
        downloadFilename: 'jsonpath-results.json',
        downloadMime: 'application/json',
      },
      meta: {
        matches: results.length,
        expression,
      },
    };
  },
};
