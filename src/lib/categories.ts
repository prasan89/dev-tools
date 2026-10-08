import type { Category } from '@/types/tool';

export const CATEGORIES: Category[] = [
  {
    id: 'json',
    slug: 'json',
    name: 'JSON Tools',
    description: 'Format, validate, transform, and query JSON data',
    longDescription:
      'Our JSON tools cover every workflow developers face when working with JSON. Instantly format and beautify raw JSON, validate syntax with precise error locations, minify for production, or run JSONPath queries to extract exactly the data you need. Need to compare two payloads? Use the visual JSON diff checker. Need to share a schema? Generate a JSON Schema automatically from sample data. All 20+ JSON tools run entirely in your browser — nothing is sent to a server.',
    icon: '{ }',
    color: 'blue',
    seoTitle: 'JSON Tools Online — Format, Validate, Compare & Convert JSON | DevToolsHub',
    seoDescription:
      'Free online JSON tools: formatter, validator, beautifier, minifier, diff checker, JSONPath tester, schema generator and 20+ more. All run in your browser.',
  },
  {
    id: 'encoding',
    slug: 'encoding',
    name: 'Encoding Tools',
    description: 'Base64, URL encode/decode, hash, and cipher utilities',
    longDescription:
      'Encoding and decoding are everyday tasks for developers working with APIs, web applications, and security. Our encoding tools let you convert text to and from Base64, encode or decode URL query strings, escape and unescape HTML entities, and decode JWT tokens to inspect their header and payload. All operations run client-side in your browser, so sensitive tokens and credentials never leave your machine.',
    icon: '⇄',
    color: 'purple',
    seoTitle: 'Encoding & Decoding Tools — Base64, URL, HTML, JWT | DevToolsHub',
    seoDescription:
      'Free online encoding tools: Base64 encoder/decoder, URL encoder, HTML encoder, JWT decoder and more. All processing happens locally in your browser.',
  },
  {
    id: 'developer',
    slug: 'developer',
    name: 'Developer Tools',
    description: 'Code formatters, linters, diff tools, and generators',
    longDescription:
      'A collection of essential utilities that speed up the everyday tasks developers repeat dozens of times a day. Generate UUIDs, create secure passwords, hash strings with MD5/SHA, pick and convert colors, encode and decode QR codes, and more. Each tool is designed to be fast, frictionless, and privacy-respecting — all computation happens in your browser with no server round-trip.',
    icon: '</>',
    color: 'green',
    seoTitle: 'Developer Tools — UUID, Password, Hash, Color & More | DevToolsHub',
    seoDescription:
      'Free online developer utilities: UUID generator, password generator, hash generator, color picker, QR code generator and more developer tools.',
  },
  {
    id: 'data-code',
    slug: 'data-code',
    name: 'Data & Code',
    description: 'CSV, regex, SQL, and data transformation tools',
    longDescription:
      'Data rarely arrives in the format you need. These tools let you convert JSON to CSV, CSV back to JSON, generate SQL INSERT statements from JSON, or scaffold TypeScript interfaces directly from a JSON object. Whether you are preparing data for a spreadsheet, seeding a database, or building type-safe API clients, the Data & Code tools handle the conversion in seconds.',
    icon: '⊞',
    color: 'orange',
    seoTitle: 'Data & Code Tools — JSON to CSV, SQL, TypeScript | DevToolsHub',
    seoDescription:
      'Convert between data formats: JSON to CSV, CSV to JSON, JSON to SQL, JSON to TypeScript and more data transformation tools.',
  },
  {
    id: 'utilities',
    slug: 'utilities',
    name: 'Utilities',
    description: 'Text tools, unit converters, color pickers, and more',
    longDescription:
      'A set of handy online utilities for everyday developer and power-user tasks. Convert units, manipulate text, pick colors, and more — all without leaving your browser tab. Each tool in this category is designed to be fast and self-contained, with no sign-up required.',
    icon: '⚙',
    color: 'gray',
    seoTitle: 'Utility Tools — Word Counter, Color Picker & More | DevToolsHub',
    seoDescription:
      'Free online utility tools for developers: word counter, color picker, unit converters, and everyday browser-based tools — no sign-up required.',
  },
  {
    id: 'developer-utilities',
    slug: 'developer-utilities',
    name: 'Developer Utilities',
    description: 'UUID, JWT, passwords, and other developer essentials',
    longDescription:
      'Developer utilities focused on formatting and transforming code and structured data. From SQL and XML beautifiers to YAML formatters and Markdown renderers, these tools help you clean up the output of codegen scripts, database dumps, and API responses before you commit them to source control.',
    icon: '⊛',
    color: 'green',
    seoTitle: 'Developer Utilities — Format, Lint & Convert Code | DevToolsHub',
    seoDescription:
      'Free developer utility tools for formatting, linting and converting code. SQL formatter, XML formatter, YAML formatter, Markdown tools and more.',
  },
  {
    id: 'date-time',
    slug: 'date-time',
    name: 'Date & Time',
    description: 'Unix timestamps, date converters, and timezone utilities',
    longDescription:
      'Working with dates and times across timezones, calendar systems, and programming languages is notoriously tricky. Our Date & Time tools take the pain out of it: convert Unix timestamps to human-readable dates and back, calculate the difference between two dates in days, weeks, or business days, compute someone\'s exact age, generate cron expressions, and convert times across timezones instantly.',
    icon: '⏱',
    color: 'orange',
    seoTitle: 'Date & Time Tools — Calculators, Converters & Timezone Tools | DevToolsHub',
    seoDescription:
      'Free online date and time tools: age calculator, date difference, business days calculator, unix timestamp converter, timezone converter, cron generator and more.',
  },
  {
    id: 'regex',
    slug: 'regex',
    name: 'Regex',
    description: 'Test and debug regular expressions in real-time',
    longDescription:
      'Writing and debugging regular expressions is much faster with immediate visual feedback. The Regex Tester highlights every match in your test string as you type, shows captured groups in a structured table, and explains common syntax elements so you can learn while you build. Supports all JavaScript regex flags including global, multiline, case-insensitive, and Unicode modes.',
    icon: '.*',
    color: 'purple',
    seoTitle: 'Regex Tester & Tools — Test Regular Expressions Online | DevToolsHub',
    seoDescription:
      'Free online regex tester with real-time matching, group capture, and syntax reference. Test JavaScript regular expressions in your browser.',
  },
  {
    id: 'sql',
    slug: 'sql',
    name: 'SQL',
    description: 'Format, beautify, and inspect SQL queries',
    longDescription:
      'Messy SQL is hard to review and even harder to debug. The SQL formatter automatically indents keywords, aligns columns, and adds consistent whitespace so every query reads clearly. Supports multiple SQL dialects including MySQL, PostgreSQL, SQLite, and MSSQL. Paste a minified or auto-generated query and get back clean, readable SQL ready to commit.',
    icon: '⊞',
    color: 'blue',
    seoTitle: 'SQL Tools — Format, Validate & Convert SQL Online | DevToolsHub',
    seoDescription:
      'Free online SQL tools: SQL formatter, SQL beautifier and SQL utilities. Format and clean SQL queries for any dialect.',
  },
  {
    id: 'xml',
    slug: 'xml',
    name: 'XML',
    description: 'Format, validate, and transform XML documents',
    longDescription:
      'XML is widely used in enterprise APIs, configuration files, and data exchange formats, but raw XML can be dense and difficult to read. Our XML tools let you format and pretty-print XML with proper indentation, validate against a schema, minify for transmission, or convert XML to JSON for use in modern JavaScript applications.',
    icon: '</>',
    color: 'green',
    seoTitle: 'XML Tools — Formatter, Validator, Converter | DevToolsHub',
    seoDescription:
      'Free online XML tools: XML formatter, validator, minifier, XML to JSON converter and more. Process XML in your browser.',
  },
  {
    id: 'yaml',
    slug: 'yaml',
    name: 'YAML',
    description: 'Format, validate, and convert YAML documents',
    longDescription:
      'YAML is the go-to format for Kubernetes manifests, CI/CD pipelines, and application config files, but indentation-sensitive syntax makes errors easy to introduce. Our YAML tools validate your YAML with detailed error messages, format it consistently, minify it for embedding in scripts, or convert it to JSON when you need to pass it to a REST API.',
    icon: '---',
    color: 'orange',
    seoTitle: 'YAML Tools — Formatter, Validator, Converter | DevToolsHub',
    seoDescription:
      'Free online YAML tools: YAML formatter, validator, minifier, YAML to JSON converter and more.',
  },
  {
    id: 'data',
    slug: 'data',
    name: 'Data Tools',
    description: 'CSV formatters, validators, and data transformation utilities',
    longDescription:
      'General-purpose data processing tools for working with structured and semi-structured data. Whether you need to reformat a CSV, compare two data sets, or transform data from one shape to another, these tools handle it in the browser without uploading your data anywhere.',
    icon: '⊞',
    color: 'teal',
    seoTitle: 'Data Tools — Process & Transform Data Online | DevToolsHub',
    seoDescription:
      'Free online data processing tools. Convert, transform and analyze data formats in your browser.',
  },
  {
    id: 'text',
    slug: 'text',
    name: 'Text Tools',
    description: 'Case converters, line sorters, duplicate removers, and text utilities',
    longDescription:
      'Text manipulation is a constant need for developers, writers, and data analysts. Our text tools let you convert between uppercase, lowercase, title case, and camelCase; sort lines alphabetically; remove duplicate lines; count words and characters; compare two pieces of text with a visual diff; and perform many other common text operations — all instantly, with no account required.',
    icon: 'Aa',
    color: 'indigo',
    seoTitle: 'Text Tools — Case Converter, Sorter, Diff & More | DevToolsHub',
    seoDescription:
      'Free online text processing tools: case converter, sort lines, remove duplicates, word count, diff checker and more.',
  },
];
