import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

interface SearchMatch {
  path: string;
  value: unknown;
}

function truncateValue(val: unknown, maxLen = 80): string {
  const str =
    val === null
      ? 'null'
      : typeof val === 'string'
      ? `"${val}"`
      : Array.isArray(val)
      ? `[Array(${(val as unknown[]).length})]`
      : typeof val === 'object'
      ? `{Object}`
      : String(val);
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

function buildMatcher(
  query: string,
  matchType: string,
  caseSensitive: boolean,
): (text: string) => boolean {
  if (matchType === 'regex') {
    const flags = caseSensitive ? '' : 'i';
    let re: RegExp;
    try {
      re = new RegExp(query, flags);
    } catch {
      throw new Error(`Invalid regular expression: ${query}`);
    }
    return (text) => re.test(text);
  }
  if (matchType === 'exact') {
    if (caseSensitive) return (text) => text === query;
    const lq = query.toLowerCase();
    return (text) => text.toLowerCase() === lq;
  }
  // default: contains
  if (caseSensitive) return (text) => text.includes(query);
  const lq = query.toLowerCase();
  return (text) => text.toLowerCase().includes(lq);
}

function searchJSON(
  node: unknown,
  currentPath: string,
  matches: SearchMatch[],
  nodeCount: { count: number },
  matcher: (text: string) => boolean,
  searchIn: string,
): void {
  nodeCount.count++;

  if (node === null || typeof node !== 'object') {
    // Leaf value
    if (searchIn !== 'keys only') {
      const strVal = typeof node === 'string' ? node : String(node);
      if (matcher(strVal)) {
        matches.push({ path: currentPath, value: node });
      }
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item, idx) => {
      const childPath = currentPath ? `${currentPath}[${idx}]` : `[${idx}]`;
      // Array indices are not "keys" in the traditional sense — only recurse into values
      searchJSON(item, childPath, matches, nodeCount, matcher, searchIn);
    });
    return;
  }

  const obj = node as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const childPath = currentPath ? `${currentPath}.${key}` : key;

    // Check the key itself
    if (searchIn !== 'values only' && matcher(key)) {
      matches.push({ path: childPath, value: obj[key] });
    }

    // Recurse into value — but only check the value at this level if it is a leaf
    // and we have not already matched via key (avoid duplicate entries)
    const val = obj[key];
    const isLeaf = val === null || typeof val !== 'object';
    if (isLeaf) {
      if (searchIn !== 'keys only') {
        // Only add a value match if the key was not already matched
        const keyAlreadyMatched =
          searchIn !== 'values only' && matcher(key);
        if (!keyAlreadyMatched) {
          const strVal = typeof val === 'string' ? val : String(val);
          if (matcher(strVal)) {
            matches.push({ path: childPath, value: val });
          }
        }
      }
      nodeCount.count++;
    } else {
      searchJSON(val, childPath, matches, nodeCount, matcher, searchIn);
    }
  }
}

export const jsonSearchProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  secondaryInputLabel: 'Search Query',
  hasSecondaryInput: true,
  autoProcess: false,

  exampleInput: JSON.stringify(
    {
      company: {
        name: 'Acme Corp',
        founded: 1990,
        departments: [
          {
            name: 'Engineering',
            head: {
              name: 'Alice Johnson',
              email: 'alice@acme.com',
              phone: '+1-555-0101',
            },
            employees: [
              { id: 1, name: 'Bob Smith', email: 'bob@acme.com', active: true },
              {
                id: 2,
                name: 'Carol White',
                email: 'carol@acme.com',
                active: false,
              },
            ],
          },
          {
            name: 'Marketing',
            head: {
              name: 'Dave Lee',
              email: 'dave@acme.com',
              phone: '+1-555-0202',
            },
            employees: [
              {
                id: 3,
                name: 'Eva Brown',
                email: 'eva@acme.com',
                active: true,
              },
            ],
          },
        ],
        contact: {
          email: 'info@acme.com',
          website: 'https://acme.com',
        },
      },
    },
    null,
    2,
  ),

  exampleSecondary: 'email',

  optionControls: [
    {
      key: 'matchType',
      type: 'select',
      label: 'Match Type',
      defaultValue: 'contains',
      options: [
        { value: 'contains', label: 'Contains' },
        { value: 'exact', label: 'Exact' },
        { value: 'regex', label: 'Regex' },
      ],
    },
    {
      key: 'searchIn',
      type: 'select',
      label: 'Search In',
      defaultValue: 'keys+values',
      options: [
        { value: 'keys+values', label: 'Keys + Values' },
        { value: 'keys only', label: 'Keys Only' },
        { value: 'values only', label: 'Values Only' },
      ],
    },
    {
      key: 'caseSensitive',
      type: 'checkbox',
      label: 'Case Sensitive',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to search.' };

    const query = (input.secondary ?? '').trim();
    if (!query) return { error: 'Enter a search query.' };

    const matchType = String(input.options?.matchType ?? 'contains');
    const searchIn = String(input.options?.searchIn ?? 'keys+values');
    const caseSensitive = Boolean(input.options?.caseSensitive ?? false);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    let matcher: (text: string) => boolean;
    try {
      matcher = buildMatcher(query, matchType, caseSensitive);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: msg };
    }

    const matches: SearchMatch[] = [];
    const nodeCount = { count: 0 };

    searchJSON(parsed, '', matches, nodeCount, matcher, searchIn);

    if (matches.length === 0) {
      return {
        output: {
          value: `No matches found for query: ${JSON.stringify(query)}`,
          type: 'text',
          label: 'Search Results',
          copyable: false,
        },
        meta: {
          'total matches': 0,
          'searched nodes': nodeCount.count,
        },
      };
    }

    const lines = matches.map(
      (m) => `"${m.path}" → ${truncateValue(m.value)}`,
    );
    const resultText = lines.join('\n');

    return {
      output: {
        value: resultText,
        type: 'text',
        label: `Search Results (${matches.length} match${matches.length !== 1 ? 'es' : ''})`,
        copyable: true,
        downloadFilename: 'search-results.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        'total matches': matches.length,
        'searched nodes': nodeCount.count,
      },
    };
  },
};
