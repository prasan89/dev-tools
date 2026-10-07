// ---------------------------------------------------------------------------
// Testing datasets — edge cases, large arrays, and structured test data
// for developers testing JSON parsing, validation, and processing.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// jsonEdgeCasesData — 20 edge case objects
// ---------------------------------------------------------------------------
export function jsonEdgeCasesData(): unknown[] {
  return [
    // 1. Empty object
    { case: 'empty-object', description: 'Completely empty object', data: {} },
    // 2. Single key
    { case: 'single-key', description: 'Object with only one key', data: { key: 'value' } },
    // 3. Deeply nested (inline sample — full depth in deeplyNestedJsonData)
    {
      case: 'deeply-nested',
      description: 'Multiple levels of nesting',
      data: { a: { b: { c: { d: { e: 'deep' } } } } },
    },
    // 4. Very long string
    {
      case: 'long-string',
      description: 'String value exceeding 500 characters',
      data: { value: 'A'.repeat(512) },
    },
    // 5. Unicode — emojis
    {
      case: 'unicode-emoji',
      description: 'String containing emoji characters',
      data: { text: '😀🎉🌍🚀💻🔥✨🎸🦄🌈' },
    },
    // 6. Unicode — CJK
    {
      case: 'unicode-cjk',
      description: 'Chinese/Japanese/Korean characters',
      data: { text: '你好世界 こんにちは世界 안녕하세요 세계' },
    },
    // 7. Special characters
    {
      case: 'special-chars',
      description: 'Backslash, quotes, and control characters',
      data: { text: 'Line1\nLine2\tTabbed\r\nWindows', path: 'C:\\Users\\test', quote: '"quoted"' },
    },
    // 8. Array of mixed types
    {
      case: 'mixed-array',
      description: 'Array containing string, number, boolean, null, object, and array',
      data: { items: ['string', 42, true, null, { nested: true }, [1, 2, 3]] },
    },
    // 9. All-null object
    {
      case: 'all-null',
      description: 'Object where every field is null',
      data: { a: null, b: null, c: null, d: null },
    },
    // 10. Boolean edge cases
    {
      case: 'booleans',
      description: 'Both boolean values explicitly',
      data: { truthy: true, falsy: false },
    },
    // 11. Number zero
    { case: 'number-zero', description: 'Zero as a numeric value', data: { value: 0 } },
    // 12. Negative zero (serialises as 0 in JSON)
    {
      case: 'negative-zero',
      description: 'Negative zero — JSON.stringify produces "0"',
      data: { value: -0, note: 'JSON.stringify(-0) === "0"' },
    },
    // 13. MAX_SAFE_INTEGER
    {
      case: 'max-safe-integer',
      description: 'Number.MAX_SAFE_INTEGER (2^53 - 1)',
      data: { value: 9007199254740991 },
    },
    // 14. MIN_SAFE_INTEGER
    {
      case: 'min-safe-integer',
      description: 'Number.MIN_SAFE_INTEGER (-(2^53 - 1))',
      data: { value: -9007199254740991 },
    },
    // 15. Float precision
    {
      case: 'float-precision',
      description: 'Floating-point arithmetic edge case',
      data: { sum: 0.1 + 0.2, expected: 0.3, actual: 0.30000000000000004 },
    },
    // 16. Empty arrays
    {
      case: 'empty-arrays',
      description: 'Object containing empty arrays at multiple levels',
      data: { list: [], nested: { items: [], meta: [] } },
    },
    // 17. Numeric string keys (object)
    {
      case: 'numeric-string-keys',
      description: 'Object with digit-only string keys',
      data: { '0': 'zero', '1': 'one', '100': 'hundred' },
    },
    // 18. Very large integer (beyond MAX_SAFE_INTEGER — loses precision)
    {
      case: 'beyond-max-safe',
      description: 'Integer beyond MAX_SAFE_INTEGER — precision loss expected',
      data: { value: 9007199254740993, note: 'May equal 9007199254740992 after parse' },
    },
    // 19. Unicode escape sequences
    {
      case: 'unicode-escapes',
      description: 'Characters that JSON commonly escapes',
      data: { text: '\u0000\u001F\u007F', note: 'Null, unit-separator, delete' },
    },
    // 20. Array of empty objects
    {
      case: 'array-of-empty-objects',
      description: 'Array whose every element is an empty object',
      data: { items: [{}, {}, {}, {}, {}] },
    },
  ];
}

// ---------------------------------------------------------------------------
// largeJsonArrayData — 200 objects, 8 fields each
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Alice', 'Bob', 'Carlos', 'Diana', 'Ethan', 'Fatima', 'George', 'Hana',
  'Ivan', 'Julia', 'Kevin', 'Lena', 'Marco', 'Nina', 'Oscar', 'Priya',
  'Quinn', 'Rosa', 'Samuel', 'Tina', 'Umar', 'Vera', 'Wade', 'Xiomara',
  'Yusuf', 'Zoe',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];
const CITIES = [
  'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Toronto',
  'Singapore', 'Dubai', 'São Paulo', 'Mumbai', 'Shanghai', 'Lagos',
  'Cairo', 'Istanbul', 'Seoul', 'Mexico City', 'Buenos Aires', 'Jakarta',
  'Nairobi',
];
const COUNTRIES = [
  'United States', 'United Kingdom', 'Japan', 'France', 'Australia',
  'Germany', 'Canada', 'Singapore', 'United Arab Emirates', 'Brazil',
  'India', 'China', 'Nigeria', 'Egypt', 'Turkey', 'South Korea', 'Mexico',
  'Argentina', 'Indonesia', 'Kenya',
];

export function largeJsonArrayData(): unknown[] {
  const records: unknown[] = [];
  for (let i = 1; i <= 200; i++) {
    const firstIdx = (i * 7) % FIRST_NAMES.length;
    const lastIdx = (i * 13) % LAST_NAMES.length;
    const cityIdx = (i * 3) % CITIES.length;
    const firstName = FIRST_NAMES[firstIdx];
    const lastName = LAST_NAMES[lastIdx];
    records.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      age: 18 + (i % 50),
      city: CITIES[cityIdx],
      country: COUNTRIES[cityIdx],
      score: Math.round(((i * 17 + 43) % 1000) / 10) / 10, // 0.0 – 99.9
      active: i % 5 !== 0,
    });
  }
  return records;
}

// ---------------------------------------------------------------------------
// nestedJsonData — 15 examples, 2-4 levels deep
// ---------------------------------------------------------------------------
export function nestedJsonData(): unknown[] {
  return [
    {
      id: 'nest-1',
      user: { name: 'Alice Smith', contact: { email: 'alice@example.com', phone: '+1-555-0101' } },
    },
    {
      id: 'nest-2',
      order: {
        orderId: 'ORD-001',
        items: [{ sku: 'PROD-A', qty: 2 }, { sku: 'PROD-B', qty: 1 }],
        shipping: { address: '123 Main St', city: 'Springfield', zip: '12345' },
      },
    },
    {
      id: 'nest-3',
      company: {
        name: 'Acme Corp',
        departments: {
          engineering: { headcount: 120, lead: 'Bob Johnson' },
          marketing: { headcount: 45, lead: 'Carol White' },
        },
      },
    },
    {
      id: 'nest-4',
      config: {
        database: { host: 'db.example.com', port: 5432, credentials: { user: 'admin', password: '***' } },
      },
    },
    {
      id: 'nest-5',
      product: {
        name: 'Widget Pro',
        pricing: { base: 99.99, discounts: { bulk: 0.1, seasonal: 0.05 } },
        inventory: { warehouse_a: 500, warehouse_b: 320 },
      },
    },
    {
      id: 'nest-6',
      event: {
        title: 'Tech Conference 2026',
        venue: { name: 'Convention Center', address: { street: '1 Congress Ave', city: 'Austin', country: 'US' } },
        schedule: { start: '2026-03-15T09:00:00Z', end: '2026-03-17T18:00:00Z' },
      },
    },
    {
      id: 'nest-7',
      survey: {
        title: 'Q4 Feedback',
        questions: [
          { id: 'q1', text: 'How satisfied are you?', type: 'scale', range: { min: 1, max: 10 } },
          { id: 'q2', text: 'Any comments?', type: 'text' },
        ],
      },
    },
    {
      id: 'nest-8',
      blog: {
        post: {
          title: 'Getting Started with TypeScript',
          author: { name: 'Dev Guru', social: { twitter: '@devguru', github: 'devguru' } },
          tags: ['typescript', 'javascript', 'tutorial'],
        },
      },
    },
    {
      id: 'nest-9',
      analytics: {
        period: '2026-Q3',
        metrics: {
          sessions: 142000,
          breakdown: { desktop: 82000, mobile: 55000, tablet: 5000 },
        },
      },
    },
    {
      id: 'nest-10',
      recipe: {
        name: 'Chocolate Cake',
        ingredients: [
          { item: 'flour', amount: '2 cups', unit: { system: 'US', abbrev: 'c' } },
          { item: 'cocoa', amount: '0.5 cups', unit: { system: 'US', abbrev: 'c' } },
        ],
        steps: [{ order: 1, instruction: 'Preheat oven' }, { order: 2, instruction: 'Mix dry ingredients' }],
      },
    },
    {
      id: 'nest-11',
      repo: {
        name: 'my-app',
        settings: {
          ci: { provider: 'GitHub Actions', triggers: ['push', 'pull_request'] },
          deploy: { target: 'production', region: 'us-east-1' },
        },
      },
    },
    {
      id: 'nest-12',
      invoice: {
        number: 'INV-2026-001',
        client: { name: 'Globex Corp', billing: { street: '742 Evergreen Terrace', city: 'Springfield' } },
        lines: [{ description: 'Consulting', hours: 8, rate: 150 }],
        totals: { subtotal: 1200, tax: 120, total: 1320 },
      },
    },
    {
      id: 'nest-13',
      device: {
        model: 'SuperPhone X',
        specs: { cpu: { cores: 8, ghz: 3.2 }, ram: { gb: 12 }, storage: { gb: 256, type: 'NVMe' } },
      },
    },
    {
      id: 'nest-14',
      game: {
        title: 'Space Quest',
        player: {
          name: 'HeroOne',
          stats: { level: 42, xp: 88200, inventory: { slots: 20, used: 11 } },
        },
      },
    },
    {
      id: 'nest-15',
      library: {
        name: 'City Public Library',
        catalog: {
          fiction: { count: 8400, featured: { title: 'The Last Byte', author: 'J. Coder' } },
          nonfiction: { count: 5200, featured: { title: 'Data Thinking', author: 'A. Analyst' } },
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// deeplyNestedJsonData — 10 objects, 5-8 levels deep
// ---------------------------------------------------------------------------
export function deeplyNestedJsonData(): unknown[] {
  return [
    // 5 levels
    {
      id: 'deep-1',
      l1: { l2: { l3: { l4: { l5: { value: 'reached level 5', index: 5 } } } } },
    },
    // 6 levels
    {
      id: 'deep-2',
      a: { b: { c: { d: { e: { f: { message: 'depth 6', timestamp: '2026-01-01T00:00:00Z' } } } } } },
    },
    // 7 levels
    {
      id: 'deep-3',
      root: {
        child: {
          subchild: {
            item: {
              detail: {
                metadata: {
                  tag: {
                    label: 'depth-7',
                    active: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    // 8 levels
    {
      id: 'deep-4',
      n1: { n2: { n3: { n4: { n5: { n6: { n7: { n8: { final: 'end of chain', depth: 8 } } } } } } } },
    },
    // 5 levels with arrays at leaf
    {
      id: 'deep-5',
      universe: {
        galaxy: {
          system: {
            planet: {
              continent: {
                cities: ['Alpha City', 'Beta Town', 'Gamma Village'],
              },
            },
          },
        },
      },
    },
    // 6 levels — config-like nesting
    {
      id: 'deep-6',
      app: {
        server: {
          middleware: {
            auth: {
              jwt: {
                config: {
                  secret: 'redacted',
                  expiresIn: '1h',
                  algorithm: 'HS256',
                },
              },
            },
          },
        },
      },
    },
    // 7 levels — taxonomy
    {
      id: 'deep-7',
      kingdom: {
        phylum: {
          class: {
            order: {
              family: {
                genus: {
                  species: {
                    name: 'Homo sapiens',
                    common: 'Human',
                  },
                },
              },
            },
          },
        },
      },
    },
    // 5 levels — recursive data structure (manual unroll)
    {
      id: 'deep-8',
      node: {
        value: 1,
        children: [
          {
            value: 2,
            children: [
              {
                value: 3,
                children: [
                  {
                    value: 4,
                    children: [
                      { value: 5, children: [] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    // 6 levels — address-like hierarchy
    {
      id: 'deep-9',
      world: {
        region: 'APAC',
        country: {
          name: 'Japan',
          prefecture: {
            name: 'Tokyo',
            ward: {
              name: 'Shinjuku',
              district: {
                name: 'Kabukicho',
                postalCode: '160-0021',
              },
            },
          },
        },
      },
    },
    // 8 levels — org hierarchy
    {
      id: 'deep-10',
      ceo: {
        name: 'Alexandra Reeves',
        reports: {
          cto: {
            name: 'Marcus Liu',
            reports: {
              vp_eng: {
                name: 'Sofia Patel',
                reports: {
                  director: {
                    name: 'James Okafor',
                    reports: {
                      manager: {
                        name: 'Yuki Tanaka',
                        reports: {
                          lead: {
                            name: 'Erin Walsh',
                            reports: {
                              engineer: { name: 'Tom Ng', level: 'IC3' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// validationTestData — 20 objects with valid, invalid, boundary, extra-field cases
// ---------------------------------------------------------------------------
export function validationTestData(): unknown[] {
  return [
    { id: 1, scenario: 'valid-basic', valid: true, name: 'Alice', age: 30, email: 'alice@example.com' },
    { id: 2, scenario: 'valid-boundary-min-age', valid: true, name: 'Bob', age: 0, email: 'bob@example.com' },
    { id: 3, scenario: 'valid-boundary-max-age', valid: true, name: 'Charlie', age: 150, email: 'charlie@example.com' },
    { id: 4, scenario: 'invalid-age-negative', valid: false, name: 'Dan', age: -1, email: 'dan@example.com', error: 'age must be >= 0' },
    { id: 5, scenario: 'invalid-age-string', valid: false, name: 'Eve', age: 'thirty', email: 'eve@example.com', error: 'age must be a number' },
    { id: 6, scenario: 'invalid-email-no-at', valid: false, name: 'Frank', age: 25, email: 'frankexample.com', error: 'invalid email format' },
    { id: 7, scenario: 'invalid-email-null', valid: false, name: 'Grace', age: 28, email: null, error: 'email is required' },
    { id: 8, scenario: 'missing-name', valid: false, age: 22, email: 'noname@example.com', error: 'name is required' },
    { id: 9, scenario: 'missing-email', valid: false, name: 'Henry', age: 35, error: 'email is required' },
    { id: 10, scenario: 'missing-age', valid: false, name: 'Isabel', email: 'isabel@example.com', error: 'age is required' },
    { id: 11, scenario: 'extra-fields', valid: true, name: 'James', age: 40, email: 'james@example.com', extra1: 'ignored', extra2: 99 },
    { id: 12, scenario: 'invalid-name-empty-string', valid: false, name: '', age: 27, email: 'empty@example.com', error: 'name must not be empty' },
    { id: 13, scenario: 'invalid-name-too-long', valid: false, name: 'A'.repeat(300), age: 31, email: 'long@example.com', error: 'name exceeds max length' },
    { id: 14, scenario: 'valid-unicode-name', valid: true, name: 'Amélie Lefèvre', age: 29, email: 'amelie@example.fr' },
    { id: 15, scenario: 'invalid-age-float', valid: false, name: 'Oliver', age: 25.5, email: 'oliver@example.com', error: 'age must be an integer' },
    { id: 16, scenario: 'invalid-age-infinity', valid: false, name: 'Paula', age: Infinity, email: 'paula@example.com', error: 'age must be finite' },
    { id: 17, scenario: 'valid-minimum-fields', valid: true, name: 'Quinn', age: 1, email: 'q@q.co' },
    { id: 18, scenario: 'invalid-all-null-fields', valid: false, name: null, age: null, email: null, error: 'all required fields are null' },
    { id: 19, scenario: 'invalid-number-as-name', valid: false, name: 42, age: 32, email: 'num@example.com', error: 'name must be a string' },
    { id: 20, scenario: 'valid-max-boundary-score', valid: true, name: 'Rachel', age: 100, email: 'rachel@example.com', score: 100 },
  ];
}

// ---------------------------------------------------------------------------
// unicodeTestData — 20 strings/objects with varied Unicode content
// ---------------------------------------------------------------------------
export function unicodeTestData(): unknown[] {
  return [
    { id: 1, category: 'emoji-faces', text: '😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚' },
    { id: 2, category: 'emoji-objects', text: '🎉🎊🎈🎁🎀🎗️🎟️🎫🎖️🏆🥇🥈🥉🏅🎖️🎗️🎑🎃🎄🎆' },
    { id: 3, category: 'cjk-chinese', text: '你好世界，这是一个测试字符串，包含中文字符。' },
    { id: 4, category: 'cjk-japanese', text: 'こんにちは世界、これはテスト文字列です。ひらがなとカタカナとkanji。' },
    { id: 5, category: 'cjk-korean', text: '안녕하세요 세계, 이것은 한국어 테스트 문자열입니다.' },
    { id: 6, category: 'arabic', text: 'مرحبا بالعالم، هذا اختبار للنص العربي.', direction: 'rtl' },
    { id: 7, category: 'hebrew', text: 'שלום עולם, זהו בדיקת מחרוזת עברית.', direction: 'rtl' },
    { id: 8, category: 'accented-latin', text: 'café, naïve, résumé, über, Ångström, façade, señor, île' },
    { id: 9, category: 'greek', text: 'Γεια σου κόσμε! Αυτό είναι ελληνικό κείμενο.' },
    { id: 10, category: 'cyrillic', text: 'Привет мир! Это строка на русском языке.' },
    { id: 11, category: 'mathematical-symbols', text: '∀x∈ℝ: x²≥0 | ∑ᵢxᵢ=∫f(x)dx | ℕ⊂ℤ⊂ℚ⊂ℝ⊂ℂ' },
    { id: 12, category: 'currency-symbols', text: '$ £ € ¥ ₹ ₩ ₽ ₿ ₫ ฿ ₱ ₪ ₦ ₺ ₲ ₡ ₢ ₣ ₤ ₥' },
    { id: 13, category: 'arrows', text: '← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓ ⇔ ⇕ ➡ ➢ ➣ ➤ ➥ ➦ ➧ ➨' },
    { id: 14, category: 'box-drawing', text: '┌──┬──┐│  │  │├──┼──┤│  │  │└──┴──┘' },
    { id: 15, category: 'mixed-scripts', text: 'English 中文 日本語 한국어 Ελληνικά русский' },
    {
      id: 16,
      category: 'unicode-in-object',
      user: { name: 'Søren Åkerström', city: 'Zürich', greeting: 'Bonjour! 😊' },
    },
    {
      id: 17,
      category: 'unicode-keys',
      data: { '名前': 'Alice', '年齢': 30, '都市': 'Tokyo' },
    },
    { id: 18, category: 'zero-width-chars', text: 'Hello\u200BWorld\u200C!\u200D', note: 'Contains zero-width space, non-joiner, joiner' },
    { id: 19, category: 'combining-characters', text: 'e\u0301 = é | n\u0303 = ñ | a\u0308 = ä' },
    { id: 20, category: 'surrogate-pairs', text: '𝕳𝖊𝖑𝖑𝖔 𝖂𝖔𝖗𝖑𝖉 — Mathematical Fraktur letters (U+1D400+)' },
  ];
}

// ---------------------------------------------------------------------------
// emptyValuesData — 15 objects with various empty value scenarios
// ---------------------------------------------------------------------------
export function emptyValuesData(): unknown[] {
  return [
    { id: 1, scenario: 'empty-string', value: '', type: 'string', description: 'Zero-length string ""' },
    { id: 2, scenario: 'zero-number', value: 0, type: 'number', description: 'Numeric zero' },
    { id: 3, scenario: 'false-boolean', value: false, type: 'boolean', description: 'Boolean false' },
    { id: 4, scenario: 'null-value', value: null, type: 'null', description: 'JSON null' },
    { id: 5, scenario: 'empty-array', value: [], type: 'array', description: 'Array with zero elements' },
    { id: 6, scenario: 'empty-object', value: {}, type: 'object', description: 'Object with zero keys' },
    { id: 7, scenario: 'whitespace-string', value: '   ', type: 'string', description: 'String of only spaces' },
    { id: 8, scenario: 'array-of-nulls', value: [null, null, null], type: 'array', description: 'Array containing only nulls' },
    { id: 9, scenario: 'array-of-empty-strings', value: ['', '', ''], type: 'array', description: 'Array of empty strings' },
    { id: 10, scenario: 'object-with-empty-values', value: { a: '', b: null, c: 0, d: false }, type: 'object', description: 'Object where all values are empty/falsy' },
    { id: 11, scenario: 'nested-empty', value: { outer: { inner: {} } }, type: 'object', description: 'Nested empty objects' },
    { id: 12, scenario: 'array-of-empty-arrays', value: [[], [], []], type: 'array', description: 'Array of empty arrays' },
    { id: 13, scenario: 'empty-string-array-mixed', value: { name: '', tags: [], meta: null }, type: 'object', description: 'Mix of empty string, empty array, and null' },
    { id: 14, scenario: 'zero-negative-zero', value: { pos: 0, neg: -0 }, type: 'object', description: 'Positive and negative zero' },
    { id: 15, scenario: 'empty-string-in-nested', value: { level1: { level2: { field: '' } } }, type: 'object', description: 'Empty string deep inside nesting' },
  ];
}

// ---------------------------------------------------------------------------
// nullValuesData — 15 objects with null in different positions/contexts
// ---------------------------------------------------------------------------
export function nullValuesData(): unknown[] {
  return [
    { id: 1, scenario: 'top-level-null-field', required_field: 'present', nullable_field: null, optional_field: 'present' },
    { id: 2, scenario: 'all-optional-null', required_field: 'present', nullable_field: null, optional_field: null },
    { id: 3, scenario: 'nested-null', required_field: 'present', nested: { value: null, other: 'ok' } },
    { id: 4, scenario: 'array-with-nulls', required_field: 'present', items: [1, null, 3, null, 5] },
    { id: 5, scenario: 'null-in-deep-nesting', required_field: 'present', deep: { a: { b: { c: null } } } },
    { id: 6, scenario: 'null-first-in-array', required_field: 'present', items: [null, 'second', 'third'] },
    { id: 7, scenario: 'null-last-in-array', required_field: 'present', items: ['first', 'second', null] },
    { id: 8, scenario: 'object-with-all-null', required_field: 'present', data: { x: null, y: null, z: null } },
    { id: 9, scenario: 'array-of-null-objects', required_field: 'present', records: [null, null, null] },
    { id: 10, scenario: 'mixed-null-and-values', required_field: 'present', a: null, b: 42, c: null, d: 'hello' },
    { id: 11, scenario: 'null-numeric-context', required_field: 'present', count: null, total: 0, average: null },
    { id: 12, scenario: 'null-bool-context', required_field: 'present', active: null, verified: true, admin: null },
    { id: 13, scenario: 'null-string-context', required_field: 'present', firstName: null, lastName: 'Smith', bio: null },
    { id: 14, scenario: 'null-nested-array-item', required_field: 'present', matrix: [[1, 2], [null, 4], [5, null]] },
    { id: 15, scenario: 'null-with-sibling-array', required_field: 'present', tags: null, meta: { author: null, date: '2026-01-01' } },
  ];
}

// ---------------------------------------------------------------------------
// largeStringsData — 10 objects with very long string values (100-1000 chars)
// ---------------------------------------------------------------------------
export function largeStringsData(): unknown[] {
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  function makeString(targetLen: number): string {
    let s = '';
    while (s.length < targetLen) s += lorem + ' ';
    return s.slice(0, targetLen);
  }

  return [
    { id: 1, size_label: '100 chars', content: makeString(100), length: 100 },
    { id: 2, size_label: '200 chars', content: makeString(200), length: 200 },
    { id: 3, size_label: '300 chars', content: makeString(300), length: 300 },
    { id: 4, size_label: '400 chars', content: makeString(400), length: 400 },
    { id: 5, size_label: '500 chars', content: makeString(500), length: 500 },
    { id: 6, size_label: '600 chars', content: makeString(600), length: 600 },
    { id: 7, size_label: '700 chars', content: makeString(700), length: 700 },
    { id: 8, size_label: '800 chars', content: makeString(800), length: 800 },
    { id: 9, size_label: '900 chars', content: makeString(900), length: 900 },
    { id: 10, size_label: '1000 chars', content: makeString(1000), length: 1000 },
  ];
}

// ---------------------------------------------------------------------------
// mixedDataTypesData — 20 objects with mixed types in arrays and objects
// ---------------------------------------------------------------------------
export function mixedDataTypesData(): unknown[] {
  return [
    { id: 1, string_field: 'hello', number_field: 42, boolean_field: true, array_field: [1, 'two', true], object_field: { x: 1 }, null_field: null },
    { id: 2, string_field: '', number_field: 0, boolean_field: false, array_field: [], object_field: {}, null_field: null },
    { id: 3, string_field: 'unicode 🎉', number_field: -99, boolean_field: true, array_field: [null, undefined, 0], object_field: { nested: { val: 1 } }, null_field: 'not null' },
    { id: 4, string_field: '42', number_field: 42, boolean_field: true, array_field: [42, '42', true, null], object_field: { type: 'coercion-test' }, null_field: null },
    { id: 5, string_field: 'true', number_field: 1, boolean_field: true, array_field: ['true', true, 1], object_field: { truthy: 'values' }, null_field: null },
    { id: 6, string_field: 'null', number_field: 0, boolean_field: false, array_field: ['null', null, 0, false, ''], object_field: { falsy: 'collection' }, null_field: null },
    { id: 7, string_field: 'array-in-object', number_field: 7, boolean_field: true, array_field: [[1, 2], [3, 4], [5, 6]], object_field: { matrix: true }, null_field: null },
    { id: 8, string_field: 'object-in-array', number_field: 8, boolean_field: false, array_field: [{ a: 1 }, { b: 2 }, { c: 3 }], object_field: { items: 3 }, null_field: null },
    { id: 9, string_field: 'deeply-mixed', number_field: 9, boolean_field: true, array_field: [1, [2, [3, [4]]]], object_field: { depth: 4 }, null_field: null },
    { id: 10, string_field: 'all-number-types', number_field: 3.14159, boolean_field: true, array_field: [0, -0, 1, -1, 0.5, -0.5, 1e10, 1e-10], object_field: { numeric: true }, null_field: null },
    { id: 11, string_field: 'max-numbers', number_field: Number.MAX_SAFE_INTEGER, boolean_field: true, array_field: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER], object_field: { extremes: true }, null_field: null },
    { id: 12, string_field: 'boolean-array', number_field: 12, boolean_field: true, array_field: [true, false, true, true, false], object_field: { allBools: true }, null_field: null },
    { id: 13, string_field: 'string-array', number_field: 13, boolean_field: false, array_field: ['', 'a', 'ab', 'abc', 'abcdefghij'], object_field: { lengths: [0, 1, 2, 3, 10] }, null_field: null },
    { id: 14, string_field: 'null-mixed-array', number_field: 14, boolean_field: true, array_field: [null, 1, null, 'text', null, true, null], object_field: { nullCount: 4 }, null_field: null },
    { id: 15, string_field: 'date-strings', number_field: 15, boolean_field: true, array_field: ['2026-01-01', '2026-01-01T00:00:00Z', '1970-01-01T00:00:00.000Z'], object_field: { dateFormats: 3 }, null_field: null },
    { id: 16, string_field: 'large-object', number_field: 16, boolean_field: false, array_field: Array.from({ length: 10 }, (_, i) => i), object_field: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 }, null_field: null },
    { id: 17, string_field: 'sparse-like', number_field: 17, boolean_field: true, array_field: [1, null, null, 4, null, 6], object_field: { sparse: true }, null_field: null },
    { id: 18, string_field: 'nested-nulls', number_field: 18, boolean_field: false, array_field: [{ a: null }, { b: null }], object_field: { inner: null }, null_field: null },
    { id: 19, string_field: 'boolean-object', number_field: 19, boolean_field: true, array_field: [true], object_field: { flag: true, inverse: false, maybe: null }, null_field: null },
    { id: 20, string_field: 'mixed-everything', number_field: -0.001, boolean_field: false, array_field: [null, false, 0, '', [], {}], object_field: { all_falsy: true }, null_field: null },
  ];
}

// ---------------------------------------------------------------------------
// paginationDatasetData — 50 items with pagination metadata
// ---------------------------------------------------------------------------
export function paginationDatasetData(): unknown[] {
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}. It contains some example text.`,
    category: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'][i % 5],
    value: Math.round((i + 1) * 1.618 * 100) / 100,
    created_at: new Date(2026, 0, 1 + (i % 28)).toISOString(),
    active: i % 7 !== 0,
    rank: i + 1,
  }));

  return [
    {
      page: 1,
      limit: 10,
      total: 50,
      total_pages: 5,
      has_next: true,
      has_prev: false,
      next_page: 2,
      prev_page: null,
      items: items.slice(0, 10),
    },
    {
      page: 2,
      limit: 10,
      total: 50,
      total_pages: 5,
      has_next: true,
      has_prev: true,
      next_page: 3,
      prev_page: 1,
      items: items.slice(10, 20),
    },
    {
      page: 3,
      limit: 10,
      total: 50,
      total_pages: 5,
      has_next: true,
      has_prev: true,
      next_page: 4,
      prev_page: 2,
      items: items.slice(20, 30),
    },
    {
      page: 4,
      limit: 10,
      total: 50,
      total_pages: 5,
      has_next: true,
      has_prev: true,
      next_page: 5,
      prev_page: 3,
      items: items.slice(30, 40),
    },
    {
      page: 5,
      limit: 10,
      total: 50,
      total_pages: 5,
      has_next: false,
      has_prev: true,
      next_page: null,
      prev_page: 4,
      items: items.slice(40, 50),
    },
  ];
}

// ---------------------------------------------------------------------------
// sortingDatasetData — 30 items for testing sort operations
// ---------------------------------------------------------------------------
export function sortingDatasetData(): unknown[] {
  const names = [
    'Zara Ahmed', 'Alice Brown', 'Marcus Chen', 'Diana Diaz', 'Ethan Evans',
    'Fatima Ford', 'George Green', 'Hana Hill', 'Ivan Ivanov', 'Julia James',
    'Kevin King', 'Lena Lee', 'Marco Müller', 'Nina Nelson', 'Oscar Olsen',
    'Priya Patel', 'Quinn Quinn', 'Rosa Reyes', 'Samuel Scott', 'Tina Torres',
    'Umar Ullah', 'Vera Vance', 'Wade Wang', 'Xiomara Xu', 'Yusuf Young',
    'Zoe Zhao', 'Aaron Adams', 'Beth Baker', 'Carl Clark', 'Donna Davis',
  ];
  const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];

  return names.map((name, i) => ({
    id: i + 1,
    name,
    date: new Date(2025, i % 12, 1 + (i % 28)).toISOString().slice(0, 10),
    score: Math.round(((i * 31 + 17) % 100) * 10) / 10,
    priority: priorities[i % 4],
    rank: 30 - i, // intentionally reversed for sort testing
    active: i % 3 !== 0,
    created_at: new Date(2025 - (i % 3), i % 12, 1 + (i % 28)).toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// filteringDatasetData — 40 items for testing filter operations
// ---------------------------------------------------------------------------
export function filteringDatasetData(): unknown[] {
  const categories = ['electronics', 'clothing', 'food', 'books', 'toys', 'furniture', 'sports', 'beauty'];
  const statuses = ['active', 'inactive', 'pending', 'archived'];
  const tagPool = ['sale', 'new', 'featured', 'limited', 'popular', 'eco', 'premium', 'clearance'];

  return Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    status: statuses[i % statuses.length],
    price: Math.round(((i + 1) * 7.77) * 100) / 100,
    in_stock: i % 4 !== 0,
    rating: Math.round(((i * 13 + 3) % 50) / 10 + 1) / 1, // 1-5 integer
    review_count: (i + 1) * 3,
    tags: [
      tagPool[i % tagPool.length],
      tagPool[(i + 3) % tagPool.length],
    ],
    created_year: 2023 + (i % 3),
    weight_kg: Math.round((0.1 + (i % 20) * 0.5) * 10) / 10,
  }));
}

// ---------------------------------------------------------------------------
// searchDatasetData — 35 items with rich text content for testing search
// ---------------------------------------------------------------------------
export function searchDatasetData(): unknown[] {
  const articles = [
    { title: 'Introduction to TypeScript', body: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds optional static typing and class-based object-oriented programming to the language.', tags: ['typescript', 'javascript', 'programming'], author: 'Alice Dev' },
    { title: 'Getting Started with React Hooks', body: 'React Hooks let you use state and other React features without writing a class. The most commonly used hooks are useState, useEffect, useContext, and useReducer.', tags: ['react', 'hooks', 'frontend', 'javascript'], author: 'Bob Coder' },
    { title: 'Understanding REST APIs', body: 'A REST API is an interface that two computer systems use to exchange information securely over the internet. Most business applications have to communicate with other internal and third-party applications.', tags: ['api', 'rest', 'http', 'backend'], author: 'Carol Engineer' },
    { title: 'Database Design Best Practices', body: 'Good database design is essential for a performant, maintainable application. Key principles include normalisation, indexing strategies, referential integrity, and choosing the right database type.', tags: ['database', 'sql', 'design', 'performance'], author: 'David DBA' },
    { title: 'Docker for Developers', body: 'Docker is an open-source platform that enables developers to package applications into containers. Containers are lightweight, standalone, executable packages that include everything needed to run an application.', tags: ['docker', 'devops', 'containers', 'deployment'], author: 'Eve Ops' },
    { title: 'CSS Grid Layout Guide', body: 'CSS Grid Layout is a two-dimensional layout system for the web. It lets you lay content out in rows and columns, and has many features that make building complex layouts straightforward.', tags: ['css', 'layout', 'grid', 'frontend'], author: 'Frank Designer' },
    { title: 'Node.js Performance Optimisation', body: 'Node.js is a JavaScript runtime built on Chrome V8. Optimising Node.js applications involves understanding the event loop, avoiding blocking operations, and using streams effectively.', tags: ['nodejs', 'performance', 'javascript', 'backend'], author: 'Grace Backend' },
    { title: 'GraphQL vs REST', body: 'GraphQL is a query language for APIs and a runtime for executing those queries. Unlike REST, GraphQL gives clients the power to ask for exactly what they need and nothing more.', tags: ['graphql', 'rest', 'api', 'architecture'], author: 'Hiro Architect' },
    { title: 'Web Accessibility Fundamentals', body: 'Web accessibility means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. Accessibility benefits all users, not just those with disabilities.', tags: ['accessibility', 'a11y', 'html', 'ux'], author: 'Isabel UX' },
    { title: 'Introduction to Machine Learning', body: 'Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.', tags: ['machine-learning', 'ai', 'data-science', 'python'], author: 'James Data' },
    { title: 'Git Workflow Strategies', body: 'A Git workflow is a recommendation for how to use Git to accomplish work in a consistent and productive manner. Gitflow, trunk-based development, and feature branch workflows are popular strategies.', tags: ['git', 'version-control', 'workflow', 'devops'], author: 'Karen DevOps' },
    { title: 'Kubernetes Basics', body: 'Kubernetes is an open-source container orchestration system for automating deployment, scaling, and management of containerised applications. It groups containers into logical units for easy management.', tags: ['kubernetes', 'k8s', 'devops', 'containers'], author: 'Leo Ops' },
    { title: 'Building Secure APIs', body: 'API security involves protecting the interfaces used by applications to communicate. Best practices include authentication, authorisation, input validation, rate limiting, and encrypting data in transit.', tags: ['security', 'api', 'authentication', 'backend'], author: 'Mia Security' },
    { title: 'Python Data Analysis with Pandas', body: 'Pandas is a fast, powerful, flexible and easy to use open-source data analysis and manipulation tool, built on top of the Python programming language.', tags: ['python', 'pandas', 'data-science', 'analytics'], author: 'Noah Analyst' },
    { title: 'Responsive Web Design Patterns', body: 'Responsive web design is an approach to web design that makes web pages render well on a variety of devices and screen sizes. Media queries, flexible grids, and responsive images are core techniques.', tags: ['responsive', 'css', 'mobile', 'design'], author: 'Olivia Designer' },
    { title: 'Microservices Architecture', body: 'Microservices are an architectural and organisational approach to software development where software is composed of small independent services that communicate over well-defined APIs.', tags: ['microservices', 'architecture', 'backend', 'devops'], author: 'Pete Architect' },
    { title: 'State Management with Redux', body: 'Redux is a predictable state container for JavaScript apps. It helps you write applications that behave consistently, run in different environments, and are easy to test.', tags: ['redux', 'react', 'state-management', 'javascript'], author: 'Quinn Frontend' },
    { title: 'Serverless Functions Explained', body: 'Serverless computing allows developers to build and run applications and services without thinking about servers. The cloud provider manages the server infrastructure automatically.', tags: ['serverless', 'cloud', 'aws', 'functions'], author: 'Rosa Cloud' },
    { title: 'Test-Driven Development (TDD)', body: 'Test-driven development is a software development process relying on software requirements being converted to test cases before software is fully developed, and tracking software development by repeatedly testing.', tags: ['tdd', 'testing', 'quality', 'programming'], author: 'Sam QA' },
    { title: 'Understanding OAuth 2.0', body: 'OAuth 2.0 is an authorisation framework that enables a third-party application to obtain limited access to an HTTP service. It is widely used for API authorisation.', tags: ['oauth', 'authentication', 'security', 'api'], author: 'Tina Auth' },
    { title: 'WebSocket Real-Time Communication', body: 'WebSocket is a computer communications protocol that provides full-duplex communication channels over a single TCP connection. It is commonly used for real-time applications like chat and live updates.', tags: ['websocket', 'realtime', 'networking', 'backend'], author: 'Uri Backend' },
    { title: 'Vue.js Component Architecture', body: 'Vue.js is a progressive JavaScript framework used to build user interfaces. Its component system allows building large-scale applications composed of small, self-contained, and reusable components.', tags: ['vuejs', 'javascript', 'components', 'frontend'], author: 'Vera Dev' },
    { title: 'SQL Query Optimisation', body: 'SQL query optimisation is the process of writing SQL queries in a way that reduces their execution time and resource consumption. Key techniques include proper indexing, avoiding full-table scans, and query restructuring.', tags: ['sql', 'database', 'performance', 'optimisation'], author: 'Will DBA' },
    { title: 'CI/CD Pipeline Setup', body: 'Continuous integration and continuous deployment automate the building, testing, and deployment of applications. A well-configured CI/CD pipeline reduces manual work and helps catch bugs early.', tags: ['ci-cd', 'devops', 'automation', 'testing'], author: 'Xena DevOps' },
    { title: 'Tailwind CSS Utility-First Approach', body: 'Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup. It promotes rapid UI development without leaving HTML.', tags: ['tailwind', 'css', 'design', 'frontend'], author: 'Yara Designer' },
    { title: 'Async JavaScript: Promises and Async/Await', body: 'JavaScript is single-threaded and uses an event loop to handle asynchronous operations. Promises and async/await provide clean patterns for handling asynchronous code without callback hell.', tags: ['javascript', 'async', 'promises', 'programming'], author: 'Zack Dev' },
    { title: 'PostgreSQL Advanced Features', body: 'PostgreSQL is a powerful open-source relational database system. Advanced features include JSONB support, full-text search, window functions, CTEs, and extensibility through custom types and functions.', tags: ['postgresql', 'database', 'sql', 'backend'], author: 'Amy DBA' },
    { title: 'React Performance Best Practices', body: 'Optimising React applications involves techniques such as memoisation with useMemo and useCallback, lazy loading components with React.lazy, code splitting, and avoiding unnecessary re-renders.', tags: ['react', 'performance', 'optimisation', 'javascript'], author: 'Ben Frontend' },
    { title: 'Linux Command Line Essentials', body: 'The Linux command line is a powerful tool for developers. Essential commands include file manipulation, process management, network tools, text processing with grep/sed/awk, and shell scripting.', tags: ['linux', 'cli', 'devops', 'sysadmin'], author: 'Cara Ops' },
    { title: 'API Rate Limiting Strategies', body: 'Rate limiting controls the rate of requests a client can make to an API. Common strategies include fixed window, sliding window, token bucket, and leaky bucket algorithms.', tags: ['api', 'rate-limiting', 'backend', 'performance'], author: 'Dan Backend' },
    { title: 'JSON Schema Validation', body: 'JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It defines the structure, content, and format of JSON data, enabling automated validation of API payloads.', tags: ['json', 'schema', 'validation', 'api'], author: 'Ellie Dev' },
    { title: 'Web Scraping with Puppeteer', body: 'Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium. It is commonly used for web scraping, automated testing, and generating PDFs from web pages.', tags: ['puppeteer', 'scraping', 'nodejs', 'automation'], author: 'Fred Dev' },
    { title: 'Introduction to Redis', body: 'Redis is an in-memory data structure store used as a database, cache, and message broker. It supports data structures such as strings, hashes, lists, sets, and sorted sets with range queries.', tags: ['redis', 'cache', 'database', 'backend'], author: 'Gina Backend' },
    { title: 'Building CLI Tools in Node.js', body: 'Command-line interfaces are powerful tools for developers. Node.js, combined with libraries like commander or yargs, makes it straightforward to build robust CLI tools with argument parsing and help generation.', tags: ['cli', 'nodejs', 'tools', 'javascript'], author: 'Hugo Dev' },
    { title: 'Event-Driven Architecture', body: 'Event-driven architecture is a software design pattern in which decoupled application components communicate through events. It enables scalable, loosely coupled systems using event buses, queues, and pub/sub patterns.', tags: ['events', 'architecture', 'backend', 'messaging'], author: 'Iris Architect' },
  ];

  return articles.map((article, i) => ({
    id: i + 1,
    ...article,
    published_at: new Date(2024 + (i % 2), i % 12, 1 + (i % 28)).toISOString(),
    views: (i + 1) * 137,
    likes: Math.floor((i + 1) * 23.7),
    reading_time_min: Math.ceil(article.body.split(' ').length / 200),
  }));
}
