import { ToolDefinition, Category, ToolCategoryId } from '@/types/tool';
import { CATEGORIES } from '@/lib/categories';

export { CATEGORIES };

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------
// (Categories are defined in src/lib/categories.ts — a lightweight module
//  imported by client components like MobileNav without pulling in TOOLS)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export const TOOLS: ToolDefinition[] = [
  // JSON Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    slug: 'json-formatter',
    category: 'json',
    description: 'Format and beautify JSON with proper indentation',
    longDescription:
      'Paste your JSON data and get it formatted with proper indentation and error detection. Supports 2-space and 4-space indentation. Copy or download the formatted result.',
    icon: '{ }',
    keywords: ['json', 'format', 'beautify', 'pretty print', 'indent', 'prettify', 'json formatter', 'json beautifier'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-validator', 'json-minifier', 'json-diff', 'json-to-csv', 'json-to-yaml', 'json-to-xml'],
    popular: true,
    order: 1,
    seoTitle: 'JSON Formatter & Beautifier — Free Online Tool',
    seoDescription:
      'Free online JSON formatter and beautifier. Pretty print and validate JSON with 2 or 4 space indentation. Works entirely in your browser — your data stays private.',
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    slug: 'json-validator',
    category: 'json',
    description: 'Validate JSON syntax and get detailed error messages',
    longDescription:
      'Instantly validates your JSON and shows exactly what is wrong — including line number and column for syntax errors. No data leaves your browser.',
    icon: '✓',
    keywords: ['json', 'validate', 'lint', 'check', 'syntax', 'error', 'json validator', 'json syntax checker', 'check json'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-minifier', 'json-diff'],
    popular: true,
    order: 2,
    seoTitle: 'JSON Validator — Free Online JSON Syntax Checker',
    seoDescription:
      'Validate JSON syntax instantly with detailed error messages, line numbers, and context. Free, private, and works entirely in your browser.',
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    slug: 'json-minifier',
    category: 'json',
    description: 'Remove whitespace from JSON to reduce file size',
    longDescription:
      'Minify JSON by parsing and re-serializing without whitespace. Shows original size, minified size, and savings percentage. Safe minification that preserves all data exactly.',
    icon: '⊞',
    keywords: ['json', 'minify', 'compress', 'shrink', 'reduce', 'json minifier', 'compress json', 'json compressor'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-diff'],
    order: 3,
    seoTitle: 'JSON Minifier — Compress JSON Online',
    seoDescription:
      'Minify and compress JSON data online. Remove whitespace safely by parsing and re-serializing. See exact bytes saved. Free and browser-only.',
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    slug: 'json-diff',
    category: 'json',
    description: 'Compare two JSON documents and highlight differences',
    longDescription:
      'Paste two JSON documents side by side and see exactly what changed — added keys, removed keys, and changed values. Supports nested objects and arrays. Comparison is positional for arrays.',
    icon: '±',
    keywords: ['json', 'diff', 'compare', 'difference', 'json diff', 'compare json', 'json comparison', 'compare json files'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-minifier'],
    popular: true,
    order: 4,
    seoTitle: 'JSON Diff — Compare Two JSON Files Online',
    seoDescription:
      'Compare two JSON documents and see exactly what changed. Highlights added, removed, and changed values including nested structures. Free and browser-only.',
  },

  // Encoding Tools
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    slug: 'base64-encoder',
    category: 'encoding',
    description: 'Convert text to Base64 — handles Unicode, emoji, and all languages',
    longDescription:
      'Encodes any text string into Base64 using proper UTF-8 encoding. Works correctly with Unicode, emoji, and non-Latin scripts. Processing happens entirely in your browser.',
    icon: '⇒',
    keywords: ['base64', 'encode', 'base64 encoder', 'text to base64', 'base64 encoding', 'btoa', 'atob'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-decoder', 'url-encoder', 'html-encoder'],
    popular: true,
    order: 1,
    seoTitle: 'Base64 Encoder — Free Online Tool',
    seoDescription:
      'Encode text to Base64 online. Correctly handles Unicode, emoji, and all languages. Free, instant, and works entirely in your browser.',
  },
  {
    id: 'base64-decoder',
    name: 'Base64 Decoder',
    slug: 'base64-decoder',
    category: 'encoding',
    description: 'Decode Base64 back to plain text — supports Unicode and emoji',
    longDescription:
      'Decodes Base64-encoded strings back to their original UTF-8 text. Validates Base64 format and provides a clear error for malformed input.',
    icon: '⇐',
    keywords: ['base64', 'decode', 'base64 decoder', 'base64 to text', 'decode base64'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder', 'url-decoder', 'html-decoder'],
    popular: true,
    order: 2,
    seoTitle: 'Base64 Decoder — Free Online Tool',
    seoDescription:
      'Decode Base64 to plain text online. Handles Unicode and emoji correctly. Free, instant, and 100% browser-based.',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    slug: 'url-encoder',
    category: 'encoding',
    description: 'Percent-encode text for safe use in URLs and query strings',
    longDescription:
      'Encodes text using percent-encoding (encodeURIComponent) so it can be safely embedded in URL query parameters, path segments, or form values. Handles Unicode and all special characters correctly.',
    icon: '%2B',
    keywords: ['url', 'encode', 'url encoder', 'percent encoding', 'encode url', 'url encode', 'query string'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['url-decoder', 'base64-encoder', 'html-encoder'],
    popular: true,
    order: 3,
    seoTitle: 'URL Encoder — Percent-Encode Text Online',
    seoDescription:
      'URL encode text for use in query strings and URL parameters. Supports Unicode and special characters. Free and browser-based.',
  },
  {
    id: 'url-decoder',
    name: 'URL Decoder',
    slug: 'url-decoder',
    category: 'encoding',
    description: 'Decode percent-encoded URLs and query string values',
    longDescription:
      'Decodes percent-encoded strings back to readable text. Handles %XX sequences, Unicode, and encoded spaces. Shows a clear error for malformed percent sequences.',
    icon: '%2B',
    keywords: ['url', 'decode', 'url decoder', 'percent decoding', 'decode url', 'urldecode'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['url-encoder', 'base64-decoder', 'html-decoder'],
    order: 4,
    seoTitle: 'URL Decoder — Decode Percent-Encoded Text Online',
    seoDescription:
      'Decode URL percent-encoded strings back to readable text. Handles Unicode and encoded special characters. Free and browser-based.',
  },
  {
    id: 'html-encoder',
    name: 'HTML Encoder',
    slug: 'html-encoder',
    category: 'encoding',
    description: 'Escape HTML special characters into safe HTML entities',
    longDescription:
      'Converts HTML special characters (&, <, >, ", \') into their HTML entity equivalents so they can be safely displayed as text on a web page. Essential for preventing XSS and displaying user content safely.',
    icon: '&lt;',
    keywords: ['html', 'encode', 'html encoder', 'escape html', 'html entities', 'html escape', 'xss'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-decoder', 'url-encoder', 'base64-encoder'],
    order: 5,
    seoTitle: 'HTML Encoder — Escape HTML Entities Online',
    seoDescription:
      'Encode HTML special characters into safe HTML entities. Converts &, <, >, ", \' and more. Free and browser-based.',
  },
  {
    id: 'html-decoder',
    name: 'HTML Decoder',
    slug: 'html-decoder',
    category: 'encoding',
    description: 'Decode HTML entities back to readable characters',
    longDescription:
      'Decodes HTML entities (&amp;, &lt;, &gt;, &quot;, &#39;) back to their original characters. Also supports numeric entities (&#65;, &#x41;). Output is always plain text — never rendered as HTML.',
    icon: '&gt;',
    keywords: ['html', 'decode', 'html decoder', 'unescape html', 'html entities', 'decode html entities'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-encoder', 'url-decoder', 'base64-decoder'],
    order: 6,
    seoTitle: 'HTML Decoder — Decode HTML Entities Online',
    seoDescription:
      'Decode HTML entities back to readable text. Supports named and numeric entities. Free and browser-based.',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    slug: 'hash-generator',
    category: 'encoding',
    description: 'Generate MD5, SHA-1, SHA-256 and other hashes',
    icon: '#',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'sha1', 'checksum', 'sha512', 'hmac'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder'],
    order: 7,
    seoTitle: 'Hash Generator — MD5, SHA-256, SHA-512 Online | DevToolsHub',
    seoDescription:
      'Generate cryptographic hashes online: MD5, SHA-1, SHA-256, SHA-384, SHA-512, and HMAC. All hashing runs in your browser — your input never leaves your device.',
  },

  // Developer Tools
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    slug: 'html-formatter',
    category: 'developer',
    description: 'Format and beautify HTML markup',
    icon: '</>',
    keywords: ['html', 'format', 'beautify', 'indent', 'markup', 'tidy'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['css-formatter', 'diff-checker'],
    order: 1,
    seoTitle: 'HTML Formatter — Beautify & Indent HTML Online | DevToolsHub',
    seoDescription:
      'Format and beautify HTML markup online. Auto-indent tags, fix nesting, and clean up HTML from minifiers or code generators. Free, browser-based HTML formatter.',
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    slug: 'css-formatter',
    category: 'developer',
    description: 'Format and beautify CSS stylesheets',
    icon: '#{}',
    keywords: ['css', 'format', 'beautify', 'style', 'stylesheet', 'indent'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['html-formatter', 'diff-checker'],
    order: 2,
    seoTitle: 'CSS Formatter — Beautify & Prettify CSS Online | DevToolsHub',
    seoDescription: 'Format and beautify CSS stylesheets online. Adds consistent indentation, spacing, and line breaks. Free online CSS formatter and prettifier.',
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    slug: 'diff-checker',
    category: 'developer',
    description: 'Compare two text blocks and highlight differences',
    icon: '±',
    keywords: ['diff', 'compare', 'text', 'difference', 'changes', 'merge', 'patch'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'html-formatter'],
    popular: true,
    order: 3,
    seoTitle: 'Diff Checker — Compare Two Text Files Online | DevToolsHub',
    seoDescription:
      'Compare two text blocks side by side and highlight every difference. Line-by-line and word-level diff with split and unified views. Free online diff checker.',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    slug: 'uuid-generator',
    category: 'developer-utilities',
    description: 'Generate random UUID v4 values — single or bulk, upper or lower case',
    longDescription:
      'Generates cryptographically random UUID v4 values using crypto.randomUUID(). Generate 1–100 UUIDs at once, toggle uppercase/lowercase output. Entirely browser-side — nothing is sent anywhere.',
    icon: '⊛',
    keywords: ['uuid', 'guid', 'random', 'generate', 'id', 'unique', 'v4', 'uuid generator', 'random id'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['uuid-validator', 'password-generator', 'hash-generator'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'UUID Generator — Generate Random UUIDs Online',
    seoDescription:
      'Generate cryptographically random UUID v4 values online. Single or bulk (1–100), uppercase or lowercase. Free and 100% browser-based.',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    slug: 'jwt-decoder',
    category: 'developer-utilities',
    description: 'Decode and inspect JWT tokens — header, payload, registered claims',
    longDescription:
      'Decodes JWT (JSON Web Token) header and payload. Shows registered claims (exp, iat, nbf, iss, sub, aud) with human-readable timestamps. Decoding does NOT verify the signature — the token is not authenticated. Processing is 100% browser-side.',
    icon: 'JWT',
    keywords: ['jwt', 'json web token', 'decode', 'header', 'payload', 'token', 'bearer', 'jwt decoder', 'decode jwt'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['base64-encoder', 'base64-decoder', 'json-formatter'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'JWT Decoder — Decode JWT Tokens Online',
    seoDescription:
      'Decode JWT header and payload instantly. View registered claims with human-readable dates. Your token never leaves the browser.',
  },
  {
    id: 'uuid-validator',
    name: 'UUID Validator',
    slug: 'uuid-validator',
    category: 'developer-utilities',
    description: 'Validate a UUID string and identify its version',
    longDescription:
      'Checks whether a string is a valid UUID and identifies the UUID version (1–5) from the version nibble. Accepts upper and lower case. Shows a clear error describing what is wrong for invalid input.',
    icon: '✓',
    keywords: ['uuid', 'guid', 'validate', 'validator', 'check', 'version', 'uuid v4', 'uuid validator'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['uuid-generator', 'hash-generator'],
    isNew: true,
    order: 3,
    seoTitle: 'UUID Validator — Validate and Identify UUID Version',
    seoDescription:
      'Validate UUID strings and identify their version (v1–v5). Accepts upper/lowercase. Free and browser-based.',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    slug: 'password-generator',
    category: 'developer-utilities',
    description: 'Generate secure random passwords with custom rules',
    longDescription:
      'Generates cryptographically secure passwords using crypto.getRandomValues(). Choose length (8–128), include uppercase, lowercase, numbers, symbols, and exclude ambiguous characters. Passwords are never stored, logged, or sent anywhere.',
    icon: '🔑',
    keywords: ['password', 'generate', 'random', 'secure', 'strong', 'password generator', 'passphrase', 'credentials'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['uuid-generator', 'hash-generator'],
    popular: true,
    isNew: true,
    order: 4,
    seoTitle: 'Password Generator — Secure Random Passwords Online',
    seoDescription:
      'Generate strong, random passwords using cryptographic randomness. Customise length, character sets, and exclusions. Passwords never leave your browser.',
  },

  // Date & Time
  {
    id: 'unix-timestamp-converter',
    name: 'Unix Timestamp Converter',
    slug: 'unix-timestamp-converter',
    category: 'date-time',
    description: 'Convert a Unix timestamp to UTC, local, and ISO 8601 dates',
    longDescription:
      'Converts Unix timestamps (seconds or milliseconds) to human-readable dates in UTC, your local timezone, and ISO 8601 format. Auto-detects seconds vs milliseconds. All processing is browser-side.',
    icon: '⏱',
    keywords: ['unix', 'timestamp', 'epoch', 'convert', 'date', 'time', 'utc', 'iso 8601', 'unix time', 'epoch converter'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['timestamp-to-date', 'date-to-unix-timestamp'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Unix Timestamp Converter — Epoch to Date Online',
    seoDescription:
      'Convert Unix/epoch timestamps to UTC, local time, and ISO 8601 format. Auto-detects seconds vs milliseconds. Free and browser-based.',
  },
  {
    id: 'timestamp-to-date',
    name: 'Timestamp to Date',
    slug: 'timestamp-to-date',
    category: 'date-time',
    description: 'Convert any numeric timestamp to a readable date and time',
    longDescription:
      'Converts numeric timestamps in seconds or milliseconds to human-readable dates. Handles past and future dates, negative timestamps (pre-1970), and auto-detects the unit. Shows UTC, local, and ISO 8601 output.',
    icon: '📅',
    keywords: ['timestamp', 'date', 'convert', 'epoch', 'unix', 'milliseconds', 'seconds', 'time', 'date converter'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['unix-timestamp-converter'],
    isNew: true,
    order: 2,
    seoTitle: 'Timestamp to Date Converter — Free Online Tool',
    seoDescription:
      'Convert numeric timestamps (seconds or milliseconds) to human-readable dates. Handles past, future, and negative timestamps. Free and browser-based.',
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    slug: 'age-calculator',
    category: 'date-time',
    description: 'Calculate exact age in years, months and days from a date of birth.',
    longDescription:
      'Calculate your exact age or the age of anything using accurate calendar arithmetic. Handles leap years and month-end edge cases correctly.',
    icon: '🎂',
    keywords: ['age', 'birthday', 'born', 'years old', 'dob', 'date of birth'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['date-difference-calculator', 'days-between-dates', 'days-until'],
    popular: false,
    isNew: true,
    seoTitle: 'Age Calculator – Calculate Your Exact Age | DevToolsHub',
    seoDescription: 'Calculate exact age in years, months and days from any date of birth. Handles leap years correctly. Free online age calculator.',
  },
  {
    id: 'date-difference-calculator',
    name: 'Date Difference Calculator',
    slug: 'date-difference-calculator',
    category: 'date-time',
    description: 'Calculate the exact difference between two dates in years, months, weeks and days.',
    longDescription:
      'Find the precise difference between any two dates using accurate calendar arithmetic. Returns the breakdown in years, months, weeks, and days.',
    icon: '📆',
    keywords: ['date difference', 'days between', 'date gap', 'date range', 'time between dates', 'calendar'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['age-calculator', 'days-between-dates', 'business-days-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Date Difference Calculator – Days Between Two Dates | DevToolsHub',
    seoDescription: 'Calculate the exact difference between two dates in years, months, weeks and days. Free online date difference calculator.',
  },
  {
    id: 'days-between-dates',
    name: 'Days Between Dates',
    slug: 'days-between-dates',
    category: 'date-time',
    description: 'Count the number of days, weeks, and weekdays between two dates.',
    longDescription:
      'Calculate the total number of calendar days, weeks, and weekdays between any two dates. Useful for project planning and deadline tracking.',
    icon: '🗓️',
    keywords: ['days between', 'count days', 'calendar days', 'weekdays', 'date range', 'duration'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['date-difference-calculator', 'business-days-calculator', 'countdown-timer'],
    popular: false,
    isNew: true,
    seoTitle: 'Days Between Dates – Count Days, Weeks & Weekdays | DevToolsHub',
    seoDescription: 'Count the exact number of days, weeks, and weekdays between two dates. Free online days between dates calculator.',
  },
  {
    id: 'business-days-calculator',
    name: 'Business Days Calculator',
    slug: 'business-days-calculator',
    category: 'date-time',
    description: 'Calculate the number of working days between two dates, excluding weekends.',
    longDescription:
      'Count working days between two dates by excluding weekends (Saturday and Sunday). Useful for SLA calculations, project planning, and deadline tracking.',
    icon: '💼',
    keywords: ['business days', 'working days', 'weekdays', 'work days', 'sla', 'exclude weekends'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['days-between-dates', 'date-difference-calculator', 'countdown-timer'],
    popular: false,
    isNew: true,
    seoTitle: 'Business Days Calculator – Working Days Between Dates | DevToolsHub',
    seoDescription: 'Calculate the number of working/business days between two dates, excluding weekends. Free online business days calculator.',
  },
  {
    id: 'add-subtract-date',
    name: 'Add / Subtract Date',
    slug: 'add-subtract-date',
    category: 'date-time',
    description: 'Add or subtract days, weeks, months, or years from any date.',
    longDescription:
      'Perform date arithmetic by adding or subtracting a given number of days, weeks, months, or years from any starting date. Great for deadline and scheduling calculations.',
    icon: '➕',
    keywords: ['add days', 'subtract days', 'date arithmetic', 'date calculation', 'future date', 'past date'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['days-between-dates', 'business-days-calculator', 'date-difference-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Add or Subtract from a Date – Date Arithmetic Calculator | DevToolsHub',
    seoDescription: 'Add or subtract days, weeks, months, or years from any date. Free online date arithmetic calculator.',
  },
  {
    id: 'time-duration-calculator',
    name: 'Time Duration Calculator',
    slug: 'time-duration-calculator',
    category: 'date-time',
    description: 'Calculate the duration in hours and minutes between two times.',
    longDescription:
      'Find the exact duration between two times of day. Handles overnight spans that cross midnight. Returns hours, minutes, and total minutes.',
    icon: '⏰',
    keywords: ['time duration', 'hours between', 'time difference', 'elapsed time', 'time calculator', 'minutes'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['date-difference-calculator', 'countdown-timer', 'days-between-dates'],
    popular: false,
    isNew: true,
    seoTitle: 'Time Duration Calculator – Hours Minutes Between Two Times | DevToolsHub',
    seoDescription: 'Calculate the duration in hours and minutes between two times of day. Handles overnight spans. Free online time duration calculator.',
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    slug: 'countdown-timer',
    category: 'date-time',
    description: 'Count down the days, hours, minutes, and seconds until any future date.',
    longDescription:
      'Display a live countdown to any future date and time. Perfect for events, deadlines, product launches, and birthdays. Updates in real time.',
    icon: '⏳',
    keywords: ['countdown', 'days until', 'event countdown', 'deadline', 'timer', 'time remaining'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['days-until', 'days-between-dates', 'business-days-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Countdown Timer – Days Until Any Date | DevToolsHub',
    seoDescription: 'Count down the days, hours, minutes, and seconds until any future date or event. Free online countdown timer.',
  },
  {
    id: 'days-until',
    name: 'Days Until',
    slug: 'days-until',
    category: 'date-time',
    description: 'Calculate how many days are left until any upcoming date.',
    longDescription:
      'Quickly find out how many days remain until a target date. Supports any future or past date reference for simple planning.',
    icon: '📅',
    keywords: ['days until', 'days left', 'how many days', 'countdown days', 'remaining days', 'deadline'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['countdown-timer', 'days-between-dates', 'age-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Days Until Calculator – How Many Days Until a Date | DevToolsHub',
    seoDescription: 'Calculate how many days are left until any upcoming date. Free online days-until calculator.',
  },
  {
    id: 'week-number-calculator',
    name: 'Week Number Calculator',
    slug: 'week-number-calculator',
    category: 'date-time',
    description: 'Find the ISO 8601 week number for any date.',
    longDescription:
      'Get the ISO 8601 week number for any calendar date. Shows the week start (Monday) and end (Sunday) dates for the chosen week.',
    icon: '📋',
    keywords: ['week number', 'iso week', 'iso 8601', 'calendar week', 'week of year', 'weeknumber'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['days-between-dates', 'date-difference-calculator', 'leap-year-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Week Number Calculator – ISO 8601 Week of the Year | DevToolsHub',
    seoDescription: 'Find the ISO 8601 week number for any date. Shows week start and end dates. Free online week number calculator.',
  },
  {
    id: 'leap-year-calculator',
    name: 'Leap Year Calculator',
    slug: 'leap-year-calculator',
    category: 'date-time',
    description: 'Check whether any year is a leap year.',
    longDescription:
      'Determine if a year is a leap year according to the Gregorian calendar rules: divisible by 4, except centuries unless also divisible by 400.',
    icon: '🗓',
    keywords: ['leap year', 'leap year checker', 'is leap year', 'gregorian calendar', 'bissextile year', 'year'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['week-number-calculator', 'date-difference-calculator', 'age-calculator'],
    popular: false,
    isNew: true,
    seoTitle: 'Leap Year Calculator – Check Any Year | DevToolsHub',
    seoDescription: 'Check whether any year is a leap year. Explains the Gregorian calendar rules. Free online leap year calculator.',
  },
  {
    id: 'date-to-unix-timestamp',
    name: 'Date to Unix Timestamp',
    slug: 'date-to-unix-timestamp',
    category: 'date-time',
    description: 'Convert a human-readable date and time to a Unix timestamp.',
    longDescription:
      'Convert any calendar date and time to a Unix epoch timestamp in seconds or milliseconds. Supports UTC and local timezone conversions.',
    icon: '🔢',
    keywords: ['date to timestamp', 'unix timestamp', 'epoch', 'convert date', 'date to epoch', 'seconds'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['unix-timestamp-to-date', 'unix-timestamp-converter', 'iso-8601-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'Date to Unix Timestamp Converter | DevToolsHub',
    seoDescription: 'Convert a human-readable date and time to a Unix timestamp in seconds or milliseconds. Free online date to Unix timestamp converter.',
  },
  {
    id: 'unix-timestamp-to-date',
    name: 'Unix Timestamp to Date',
    slug: 'unix-timestamp-to-date',
    category: 'date-time',
    description: 'Convert a Unix timestamp to a human-readable date and time.',
    longDescription:
      'Convert Unix epoch timestamps (seconds or milliseconds) to human-readable dates. Auto-detects the unit and shows UTC, local, and ISO 8601 output.',
    icon: '🕐',
    keywords: ['unix to date', 'timestamp to date', 'epoch to date', 'unix converter', 'epoch time', 'milliseconds'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['date-to-unix-timestamp', 'unix-timestamp-converter', 'iso-8601-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'Unix Timestamp to Date Converter | DevToolsHub',
    seoDescription: 'Convert Unix timestamps (seconds or milliseconds) to human-readable dates. Auto-detects unit. Free online timestamp to date converter.',
  },
  {
    id: 'iso-8601-converter',
    name: 'ISO 8601 Converter',
    slug: 'iso-8601-converter',
    category: 'date-time',
    description: 'Parse and convert ISO 8601 date strings to other formats.',
    longDescription:
      'Parse any ISO 8601 date or datetime string and convert it to Unix timestamp, local date, or other formats. Validates the ISO 8601 format and shows component breakdown.',
    icon: '📡',
    keywords: ['iso 8601', 'iso date', 'date string', 'parse date', 'date format', 'datetime', 'zulu time'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['date-format-converter', 'unix-timestamp-converter', 'date-to-unix-timestamp'],
    popular: false,
    isNew: true,
    seoTitle: 'ISO 8601 Converter – Parse and Convert ISO Dates | DevToolsHub',
    seoDescription: 'Parse and convert ISO 8601 date strings to Unix timestamps, local dates, and other formats. Free online ISO 8601 converter.',
  },
  {
    id: 'date-format-converter',
    name: 'Date Format Converter',
    slug: 'date-format-converter',
    category: 'date-time',
    description: 'Convert a date between different format patterns like MM/DD/YYYY and YYYY-MM-DD.',
    longDescription:
      'Reformat dates from one display pattern to another. Supports common formats such as ISO 8601, US date, European date, and custom patterns.',
    icon: '🔄',
    keywords: ['date format', 'date converter', 'reformat date', 'date pattern', 'mm/dd/yyyy', 'yyyy-mm-dd'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['iso-8601-converter', 'unix-timestamp-converter', 'timezone-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'Date Format Converter – Convert Between Date Formats | DevToolsHub',
    seoDescription: 'Convert dates between different format patterns like MM/DD/YYYY, DD/MM/YYYY, and YYYY-MM-DD. Free online date format converter.',
  },
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    slug: 'timezone-converter',
    category: 'date-time',
    description: 'Convert a date and time from one timezone to another.',
    longDescription:
      'Convert any date and time between world timezones. Supports all IANA timezone identifiers and handles daylight saving time automatically.',
    icon: '🌍',
    keywords: ['timezone', 'time zone', 'convert timezone', 'utc offset', 'dst', 'iana timezone', 'time conversion'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['utc-converter', 'world-clock', 'meeting-time-planner'],
    popular: false,
    isNew: true,
    seoTitle: 'Timezone Converter – Convert Time Between Timezones | DevToolsHub',
    seoDescription: 'Convert date and time between any world timezones. Supports all IANA timezones and handles DST automatically. Free online timezone converter.',
  },
  {
    id: 'utc-converter',
    name: 'UTC Converter',
    slug: 'utc-converter',
    category: 'date-time',
    description: 'Convert local time to UTC and display the offset.',
    longDescription:
      'Convert your local date and time to Coordinated Universal Time (UTC) and vice versa. Shows the UTC offset and handles daylight saving time.',
    icon: '🌐',
    keywords: ['utc', 'utc converter', 'local to utc', 'utc time', 'coordinated universal time', 'utc offset'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['timezone-converter', 'world-clock', 'unix-timestamp-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'UTC Converter – Convert Local Time to UTC | DevToolsHub',
    seoDescription: 'Convert local date and time to UTC and back. Shows UTC offset, handles DST. Free online UTC time converter.',
  },
  {
    id: 'world-clock',
    name: 'World Clock',
    slug: 'world-clock',
    category: 'date-time',
    description: 'Display the current time in multiple cities around the world.',
    longDescription:
      'View the current time in major cities and timezones simultaneously. Useful for distributed teams and scheduling international meetings.',
    icon: '🕰️',
    keywords: ['world clock', 'current time', 'time zones', 'city time', 'global time', 'international time'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['timezone-converter', 'meeting-time-planner', 'utc-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'World Clock – Current Time in Any City | DevToolsHub',
    seoDescription: 'View the current time in multiple cities and timezones around the world. Free online world clock.',
  },
  {
    id: 'meeting-time-planner',
    name: 'Meeting Time Planner',
    slug: 'meeting-time-planner',
    category: 'date-time',
    description: 'Find the best overlap time for meetings across different timezones.',
    longDescription:
      'Plan meetings across multiple timezones by comparing work-hour overlaps. Add participant locations and instantly see when everyone is available during business hours.',
    icon: '🤝',
    keywords: ['meeting planner', 'timezone overlap', 'meeting time', 'schedule meeting', 'distributed team', 'overlap hours'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['world-clock', 'timezone-converter', 'utc-converter'],
    popular: false,
    isNew: true,
    seoTitle: 'Meeting Time Planner – Find Overlap Across Timezones | DevToolsHub',
    seoDescription: 'Find the best overlap time for meetings across multiple timezones. Compare working hours and schedule across distributed teams. Free online meeting planner.',
  },
  {
    id: 'cron-generator',
    name: 'Cron Expression Generator',
    slug: 'cron-generator',
    category: 'date-time',
    description: 'Build cron expressions visually by selecting schedule options.',
    longDescription:
      'Generate valid cron expressions for standard and non-standard cron schedulers. Select frequency, time, and day options visually and see the expression update live.',
    icon: '⚙️',
    keywords: ['cron', 'cron expression', 'cron generator', 'cron schedule', 'cron builder', 'scheduler'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['cron-parser', 'countdown-timer', 'days-until'],
    popular: false,
    isNew: true,
    seoTitle: 'Cron Expression Generator – Build Cron Jobs Visually | DevToolsHub',
    seoDescription: 'Build and generate cron expressions visually. Select schedule options and see the cron expression update in real time. Free online cron generator.',
  },
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser',
    slug: 'cron-parser',
    category: 'date-time',
    description: 'Decode and explain any cron expression in plain English.',
    longDescription:
      'Paste any cron expression and get a plain-English explanation of what schedule it represents. Shows the next N scheduled run times.',
    icon: '🔍',
    keywords: ['cron parser', 'cron expression', 'decode cron', 'cron schedule', 'cron explain', 'crontab'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['cron-generator', 'countdown-timer', 'days-until'],
    popular: false,
    isNew: true,
    seoTitle: 'Cron Expression Parser – Decode Cron Schedule | DevToolsHub',
    seoDescription: 'Decode and explain any cron expression in plain English. Shows next scheduled run times. Free online cron expression parser.',
  },

  // Regex
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    category: 'regex',
    description: 'Test and debug regular expressions with match highlighting and capture groups',
    longDescription:
      'Test JavaScript regular expressions interactively. Enter a pattern, choose flags (g, i, m, s, u, y), and see all matches, capture groups, named groups, and match positions — all browser-side, nothing sent to a server.',
    icon: '.*',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'match', 'test', 'debug', 'regex tester', 'online regex', 'regular expression tester', 'regex checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'url-encoder', 'html-encoder'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Regex Tester — Test Regular Expressions Online',
    seoDescription:
      'Test and debug regular expressions in your browser. See all matches, capture groups, and named groups with position info. Supports g, i, m, s, u, y flags. Free.',
  },

  // SQL
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    slug: 'sql-formatter',
    category: 'sql',
    description: 'Format and beautify SQL queries for readability',
    longDescription:
      'Paste any SQL query and get it formatted with consistent indentation and keyword casing. Supports SELECT, INSERT, UPDATE, DELETE, JOINs, subqueries, CASE, and more. Supports MySQL, PostgreSQL, SQL Server, SQLite, and generic SQL. Never executes queries — formatting is text-only, browser-side.',
    icon: '⊞',
    keywords: ['sql', 'format', 'beautify', 'sql formatter', 'sql pretty printer', 'format sql', 'sql beautifier', 'mysql', 'postgresql'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'xml-formatter', 'yaml-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'SQL Formatter — Beautify SQL Queries Online',
    seoDescription:
      'Format and beautify SQL queries online. Supports MySQL, PostgreSQL, SQL Server, SQLite. No query execution — browser-only text formatting. Free.',
  },

  // XML
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    slug: 'xml-formatter',
    category: 'xml',
    description: 'Format, pretty-print, and validate XML documents',
    longDescription:
      'Paste XML and get it beautifully formatted with proper indentation. Validates structure and reports parsing errors with line numbers. Preserves declarations, comments, CDATA, namespaces, and self-closing tags. Processes entirely in your browser.',
    icon: '</>',
    keywords: ['xml', 'format', 'beautify', 'pretty print', 'xml formatter', 'xml beautifier', 'format xml', 'xml validator', 'pretty print xml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'yaml-formatter', 'sql-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'XML Formatter — Pretty Print and Validate XML Online',
    seoDescription:
      'Format and validate XML documents online. Detects errors with line info, preserves comments and CDATA. Free and browser-based.',
  },

  // YAML
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    slug: 'yaml-formatter',
    category: 'yaml',
    description: 'Format and beautify YAML documents',
    longDescription:
      'Paste YAML and get it reformatted with consistent indentation. Validates syntax, reports errors with line/column info, and handles mappings, sequences, booleans, nulls, numbers, and multiline strings. Parsed locally — your data never leaves the browser.',
    icon: '---',
    keywords: ['yaml', 'format', 'beautify', 'yaml formatter', 'yaml beautifier', 'format yaml', 'yaml pretty printer', 'yaml validator', 'yaml linter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-to-json', 'json-formatter', 'xml-formatter'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'YAML Formatter — Beautify and Validate YAML Online',
    seoDescription:
      'Format and validate YAML documents online. Reports errors with line/column info. Handles all standard YAML types. Free and browser-based.',
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    slug: 'yaml-to-json',
    category: 'yaml',
    description: 'Convert YAML to JSON — safely parsed, browser-only',
    longDescription:
      'Convert YAML documents to formatted JSON. Handles nested mappings, sequences, booleans, numbers, null, Unicode, and multiline strings. Uses safe YAML parsing — no arbitrary code execution. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['yaml', 'json', 'convert', 'yaml to json', 'yaml converter', 'convert yaml to json', 'yaml json converter', 'yaml parser'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'json-formatter', 'xml-formatter'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'YAML to JSON Converter — Convert YAML Online',
    seoDescription:
      'Convert YAML to JSON online. Safely parses YAML using js-yaml — no code execution. Handles nested structures, types, and Unicode. Free and browser-based.',
  },

  // JSON Conversion Tools
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    slug: 'json-to-csv',
    category: 'json',
    description: 'Convert a JSON array of objects to CSV — handles nested values, quotes, and Unicode',
    longDescription:
      'Convert a JSON array of objects into a properly-escaped CSV file. Headers are derived from object keys. Nested objects and arrays are serialized as JSON strings. Supports comma, semicolon, tab, and pipe delimiters. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'csv', 'convert', 'json to csv', 'export csv', 'spreadsheet', 'json converter', 'csv exporter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-to-json', 'json-formatter', 'json-to-yaml', 'json-to-xml'],
    popular: false,
    isNew: true,
    order: 5,
    seoTitle: 'JSON to CSV Converter — Free Online Tool',
    seoDescription:
      'Convert JSON arrays to CSV online. Handles nested objects, quoted commas, missing fields, and multiple delimiters (comma, semicolon, tab, pipe). Free and browser-only.',
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    slug: 'csv-to-json',
    category: 'json',
    description: 'Convert CSV data to a JSON array — handles quoted fields, multiline values, and Unicode',
    longDescription:
      'Parse CSV text into a JSON array of objects (or arrays when no headers). Handles RFC 4180 quoted fields, embedded commas and newlines, and all common delimiters. Processing is 100% browser-side.',
    icon: '⇐',
    keywords: ['csv', 'json', 'convert', 'csv to json', 'csv parser', 'import json', 'spreadsheet', 'csv converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-csv', 'json-formatter', 'json-to-yaml'],
    popular: false,
    isNew: true,
    order: 6,
    seoTitle: 'CSV to JSON Converter — Free Online Tool',
    seoDescription:
      'Convert CSV data to JSON online. Handles quoted fields, embedded commas, multiline values, and all common delimiters. Free and browser-only.',
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    slug: 'json-to-yaml',
    category: 'json',
    description: 'Convert JSON to YAML — browser-side, no code execution',
    longDescription:
      'Convert any JSON object or array to YAML. Handles nested structures, booleans, numbers, null, arrays, and Unicode strings. Uses the same safe YAML library as the YAML Formatter. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'yaml', 'convert', 'json to yaml', 'json converter', 'yaml converter', 'convert json to yaml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-to-json', 'yaml-formatter', 'json-formatter', 'json-to-csv'],
    popular: false,
    isNew: true,
    order: 7,
    seoTitle: 'JSON to YAML Converter — Free Online Tool',
    seoDescription:
      'Convert JSON to YAML online. Handles all JSON types including nested objects, arrays, booleans, and null. Uses safe YAML serialization. Free and browser-only.',
  },
  {
    id: 'json-to-xml',
    name: 'JSON to XML',
    slug: 'json-to-xml',
    category: 'json',
    description: 'Convert JSON to well-formed XML — safe escaping, configurable root element',
    longDescription:
      'Convert JSON to valid, well-formed XML. Objects become nested elements, arrays become repeated sibling elements, primitives become text nodes, and null becomes an xsi:nil element. XML names are sanitized automatically. Processing is 100% browser-side.',
    icon: '⇒',
    keywords: ['json', 'xml', 'convert', 'json to xml', 'json converter', 'xml converter', 'convert json to xml'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'json-formatter', 'json-to-yaml', 'json-to-csv'],
    popular: false,
    isNew: true,
    order: 8,
    seoTitle: 'JSON to XML Converter — Free Online Tool',
    seoDescription:
      'Convert JSON to well-formed XML online. Handles nested objects, arrays, booleans, null, and Unicode with safe XML escaping. Configurable root element. Free, browser-only.',
  },

  // Data & Code
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    slug: 'markdown-preview',
    category: 'data-code',
    description: 'Preview and render Markdown in real-time',
    icon: 'Md',
    keywords: ['markdown', 'preview', 'render', 'md', 'text', 'html', 'commonmark'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['html-formatter', 'diff-checker'],
    order: 3,
    seoTitle: 'Markdown Preview — Live Markdown Renderer Online | DevToolsHub',
    seoDescription:
      'Preview and render Markdown in real-time. Write CommonMark and see the formatted output instantly. Free online Markdown editor and previewer.',
  },

  // Utilities
  {
    id: 'word-counter',
    name: 'Word Counter',
    slug: 'word-counter',
    category: 'utilities',
    description: 'Count words, characters, lines, and sentences',
    icon: 'W',
    keywords: ['word', 'count', 'character', 'text', 'words', 'lines', 'sentences', 'paragraphs'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['markdown-preview', 'diff-checker'],
    popular: true,
    order: 1,
    seoTitle: 'Word Counter — Count Words & Characters Online | DevToolsHub',
    seoDescription:
      'Count words, characters, sentences, paragraphs, and estimated reading time. Free online word and character counter — paste any text for an instant analysis.',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    slug: 'color-picker',
    category: 'utilities',
    description: 'Pick colors and convert between HEX, RGB, HSL formats',
    icon: '◉',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'picker', 'converter', 'palette', 'rgba'],
    enabled: true,
    privacySensitive: false,
    relatedTools: ['css-formatter'],
    order: 2,
    seoTitle: 'Color Picker & Converter — HEX, RGB, HSL Online | DevToolsHub',
    seoDescription:
      'Pick colors visually and convert between HEX, RGB, RGBA, and HSL color formats. Free online color picker and color code converter for designers and developers.',
  },

  // JSON Utilities
  {
    id: 'jsonpath-tester',
    name: 'JSONPath Tester',
    slug: 'jsonpath-tester',
    category: 'json',
    description: 'Test and evaluate JSONPath expressions against JSON data',
    longDescription:
      'Evaluate JSONPath expressions against JSON input and see matched values. Supports dot notation, bracket notation, wildcards (*), recursive descent (..), array slicing, and filters. Uses the JSONPath-Plus library.',
    icon: '$..',
    keywords: ['jsonpath', 'json path', 'query', 'extract', 'filter', 'json query', 'jsonpath expression', 'json selector'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-schema-validator', 'json-sorter'],
    popular: true,
    isNew: true,
    order: 7,
    seoTitle: 'JSONPath Tester — Test JSONPath Expressions Online',
    seoDescription:
      'Test and evaluate JSONPath expressions against JSON data. Supports wildcards, recursive descent, filters, and array slices. Free and browser-based.',
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    slug: 'json-schema-validator',
    category: 'json',
    description: 'Validate JSON against a JSON Schema (draft-07)',
    longDescription:
      'Validate JSON data against a JSON Schema. Supports JSON Schema draft-07 including required properties, types, arrays, enums, string patterns, numeric constraints, nested objects, and anyOf/oneOf/allOf combiners. Uses the Ajv library.',
    icon: '✓{}',
    keywords: ['json schema', 'validate', 'ajv', 'draft-07', 'schema', 'validation', 'json validator', 'json schema validator'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'jsonpath-tester'],
    popular: true,
    isNew: true,
    order: 8,
    seoTitle: 'JSON Schema Validator — Validate JSON Against a Schema',
    seoDescription:
      'Validate JSON data against JSON Schema (draft-07). Detailed error messages with paths. Free, browser-based, uses Ajv.',
  },
  {
    id: 'json-escape',
    name: 'JSON Escape / Unescape',
    slug: 'json-escape',
    category: 'json',
    description: 'Escape or unescape JSON strings — quotes, backslashes, newlines, and Unicode',
    longDescription:
      'Escape a raw string so it is safe to embed inside a JSON string value, or unescape a JSON-encoded string back to its original form. Handles backslashes, double quotes, newlines (\\n), tabs (\\t), carriage returns (\\r), and Unicode escapes (\\uXXXX).',
    icon: '"\\n"',
    keywords: ['json escape', 'unescape', 'string escape', 'json string', 'backslash', 'newline', 'unicode escape', 'json encode'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'url-encoder', 'html-encoder'],
    isNew: true,
    order: 9,
    seoTitle: 'JSON Escape / Unescape — Escape JSON Strings Online',
    seoDescription:
      'Escape or unescape JSON strings. Handles quotes, backslashes, newlines, tabs, and Unicode escapes. Free, browser-based.',
  },
  {
    id: 'json-sorter',
    name: 'JSON Sorter',
    slug: 'json-sorter',
    category: 'json',
    description: 'Sort JSON object keys alphabetically, recursively',
    longDescription:
      'Sort the keys of a JSON object alphabetically. Recursive mode sorts keys at every nesting level. Array order is never modified. Configurable ascending or descending key order.',
    icon: 'A→Z',
    keywords: ['json sort', 'sort keys', 'alphabetical', 'json organizer', 'json order', 'json key sort'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-diff', 'jsonpath-tester'],
    isNew: true,
    order: 10,
    seoTitle: 'JSON Sorter — Sort JSON Object Keys Alphabetically',
    seoDescription:
      'Sort JSON object keys alphabetically. Recursive sorting for nested objects. Preserves array order. Free and browser-based.',
  },
  {
    id: 'json-repair',
    name: 'JSON Repair',
    slug: 'json-repair',
    category: 'json',
    description: 'Fix malformed JSON automatically — repairs trailing commas, single quotes, unquoted keys, and more',
    longDescription:
      'Automatically detect and repair common JSON syntax errors. Handles trailing commas, single quotes instead of double quotes, unquoted keys, JavaScript comments, NaN/Infinity values, and more. Shows a clear summary of every repair made.',
    icon: '⚕',
    keywords: ['json repair', 'fix json', 'invalid json', 'malformed json', 'json fixer', 'json error fix'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-validator', 'json-formatter', 'json-sorter'],
    popular: true,
    order: 13,
    seoTitle: 'JSON Repair Online — Fix Invalid JSON Free',
    seoDescription:
      'Repair malformed JSON instantly. Fixes trailing commas, single quotes, unquoted keys, comments, NaN/Infinity, and more. Free, browser-only, no data sent to server.',
  },
  {
    id: 'json-flatten',
    name: 'JSON Flatten',
    slug: 'json-flatten',
    category: 'json',
    description: 'Flatten nested JSON to a single level using dot notation',
    longDescription:
      'Convert deeply nested JSON objects to flat single-level objects using dot notation (user.address.city) or bracket notation for arrays. Also supports unflattening back to nested structure.',
    icon: '⇥',
    keywords: ['json flatten', 'flatten json', 'nested json', 'json dot notation', 'flatten nested json'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-sorter', 'json-schema-generator'],
    order: 14,
    seoTitle: 'JSON Flatten — Flatten Nested JSON Online Free',
    seoDescription:
      'Flatten nested JSON objects to a single level using dot or slash notation. Also supports unflattening. Free, private, browser-only.',
  },
  {
    id: 'json-size-analyzer',
    name: 'JSON Size Analyzer',
    slug: 'json-size-analyzer',
    category: 'json',
    description: 'Analyze JSON structure — count keys, objects, arrays, nesting depth, and size',
    longDescription:
      'Get a full structural breakdown of any JSON document: file size in bytes/KB/MB, total keys, object count, array count, value type distribution, maximum nesting depth, and the largest keys by size.',
    icon: '📊',
    keywords: ['json size', 'json analyzer', 'json structure', 'json stats', 'json size analyzer', 'count json keys'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-flatten', 'json-token-counter'],
    order: 15,
    seoTitle: 'JSON Size Analyzer — Analyze JSON Structure Online',
    seoDescription:
      'Analyze JSON size and structure: bytes, key count, object/array counts, nesting depth, largest keys. Free browser-only tool.',
  },
  {
    id: 'json-search',
    name: 'JSON Search',
    slug: 'json-search',
    category: 'json',
    description: 'Search through JSON keys and values recursively',
    longDescription:
      'Search recursively through all keys and values in a JSON document. Returns matching paths in dot notation. Supports contains, exact match, and regex search modes.',
    icon: '🔍',
    keywords: ['json search', 'search json', 'find in json', 'json find', 'search json keys', 'json path finder'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['jsonpath-tester', 'json-flatten', 'json-formatter'],
    order: 16,
    seoTitle: 'JSON Search — Search Keys and Values in JSON Online',
    seoDescription:
      'Search recursively through JSON keys and values. Find matching paths instantly with contains, exact, or regex search. Free and browser-only.',
  },
  {
    id: 'json-stringify',
    name: 'JSON Stringify',
    slug: 'json-stringify',
    category: 'json',
    description: 'Convert JSON to an escaped string literal for embedding in code',
    longDescription:
      'Convert a JSON document to an escaped string literal ready to embed in JavaScript, Python, Go, or Java code. Equivalent to JSON.stringify() but with language-specific output formatting.',
    icon: '"',
    keywords: ['json stringify', 'json to string', 'json escape string', 'json.stringify online', 'json string literal'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-escape', 'json-formatter', 'json-minifier'],
    order: 17,
    seoTitle: 'JSON Stringify Online — Convert JSON to String Literal',
    seoDescription:
      'Convert JSON to an escaped string literal for JavaScript, Python, Go, or Java. Free online JSON.stringify tool, browser-only.',
  },
  {
    id: 'json-token-counter',
    name: 'JSON Token Counter',
    slug: 'json-token-counter',
    category: 'json',
    description: 'Estimate the LLM token count of a JSON document',
    longDescription:
      'Get an approximate token count for your JSON data — useful for estimating API costs before sending JSON to LLMs like GPT-4 or Claude. Uses heuristic estimation and clearly labels results as approximations.',
    icon: '#',
    keywords: ['json token count', 'json tokens', 'llm token counter', 'json gpt tokens', 'token counter json', 'count json tokens'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-size-analyzer', 'json-minifier', 'json-formatter'],
    order: 18,
    seoTitle: 'JSON Token Counter — Estimate LLM Tokens in JSON',
    seoDescription:
      'Estimate how many LLM tokens your JSON uses. Approximate counts for GPT-4, Claude, and more. Free browser-only tool — no data sent anywhere.',
  },
  {
    id: 'jsonc-to-json',
    name: 'JSONC to JSON',
    slug: 'jsonc-to-json',
    category: 'json',
    description: 'Strip comments and trailing commas from JSONC to produce valid JSON',
    longDescription:
      'Convert JSON with Comments (JSONC) — used in VS Code settings, tsconfig.json, and similar files — to standard JSON by safely stripping // comments, /* */ block comments, and trailing commas.',
    icon: '//',
    keywords: ['jsonc', 'jsonc to json', 'json with comments', 'strip json comments', 'tsconfig json', 'vscode settings json'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-validator', 'json-repair'],
    order: 19,
    seoTitle: 'JSONC to JSON — Remove Comments Online Free',
    seoDescription:
      'Convert JSONC (JSON with Comments) to standard JSON. Strips // and /* */ comments and trailing commas. Used for tsconfig, VS Code settings. Free browser-only tool.',
  },
  {
    id: 'json-to-sql',
    name: 'JSON to SQL',
    slug: 'json-to-sql',
    category: 'json',
    description: 'Convert a JSON array to SQL CREATE TABLE and INSERT statements',
    longDescription:
      'Turn a JSON array of objects into ready-to-use SQL statements. Automatically infers column types, generates CREATE TABLE with proper data types, and produces INSERT INTO statements for all records. Supports MySQL, PostgreSQL, and SQLite dialects.',
    icon: '⊡',
    keywords: ['json to sql', 'json to sql insert', 'json array to sql', 'convert json to sql', 'json sql generator'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-to-csv', 'csv-to-json'],
    order: 20,
    seoTitle: 'JSON to SQL — Convert JSON Array to SQL Online Free',
    seoDescription:
      'Convert JSON array to SQL INSERT statements with automatic type inference. Generates CREATE TABLE and INSERT INTO for MySQL, PostgreSQL, SQLite. Free browser-only.',
  },
  {
    id: 'json-to-markdown',
    name: 'JSON to Markdown',
    slug: 'json-to-markdown',
    category: 'json',
    description: 'Convert JSON arrays and objects to Markdown tables',
    longDescription:
      'Transform a JSON array of objects into a Markdown table, or a single JSON object into a key-value table. Useful for documentation, READMEs, and reports. Also supports definition list and code block formats.',
    icon: '↓',
    keywords: ['json to markdown', 'json to markdown table', 'json table markdown', 'convert json markdown', 'json to md'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-to-csv', 'json-table-viewer'],
    order: 21,
    seoTitle: 'JSON to Markdown Table — Convert JSON Online Free',
    seoDescription:
      'Convert JSON arrays to Markdown tables instantly. Also supports key-value tables and code blocks. Free browser-only JSON to Markdown converter.',
  },
  {
    id: 'json-schema-generator',
    name: 'JSON Schema Generator',
    slug: 'json-schema-generator',
    category: 'json',
    description: 'Generate a JSON Schema from a JSON example',
    longDescription:
      'Automatically generate a JSON Schema (Draft-07 or 2020-12) from any JSON document. Infers types, required fields, and nested structure. Useful for API documentation, validation, and code generation.',
    icon: '⊞',
    keywords: ['json schema generator', 'generate json schema', 'json schema from json', 'json schema draft-07', 'create json schema'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-schema-validator', 'json-formatter', 'json-validator'],
    order: 22,
    seoTitle: 'JSON Schema Generator — Generate JSON Schema Online Free',
    seoDescription:
      'Generate JSON Schema (Draft-07 or 2020-12) from any JSON example. Infers types, required fields, nested objects and arrays. Free browser-only tool.',
  },
  {
    id: 'json-table-viewer',
    name: 'JSON Table Viewer',
    slug: 'json-table-viewer',
    category: 'json',
    description: 'View JSON arrays as formatted ASCII/Unicode tables',
    longDescription:
      'Render any JSON array of objects as a clean ASCII or Unicode table. Supports column width limits, row limits, and multiple table border styles including Markdown table format.',
    icon: '⊟',
    keywords: ['json table', 'json table viewer', 'json to table', 'json array table', 'view json as table'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-to-markdown', 'json-to-csv'],
    order: 23,
    seoTitle: 'JSON Table Viewer — View JSON as Table Online',
    seoDescription:
      'View JSON arrays as formatted tables online. ASCII, Unicode box-drawing, and Markdown table styles. Free browser-only tool.',
  },
  {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    slug: 'json-to-typescript',
    category: 'json',
    description: 'Generate TypeScript interfaces from JSON',
    longDescription:
      'Convert any JSON object or array to TypeScript interface definitions. Infers accurate types including nested interfaces, arrays, and unions. Supports optional fields and export keyword.',
    icon: 'TS',
    keywords: ['json to typescript', 'json typescript interface', 'generate typescript from json', 'json to ts interface', 'typescript from json'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-formatter', 'json-schema-generator', 'json-to-python'],
    order: 24,
    seoTitle: 'JSON to TypeScript — Generate TypeScript Interfaces Online',
    seoDescription:
      'Generate TypeScript interfaces from JSON instantly. Infers types for nested objects, arrays, and primitives. Free browser-only tool.',
  },
  {
    id: 'json-to-python',
    name: 'JSON to Python',
    slug: 'json-to-python',
    category: 'json',
    description: 'Generate Python dataclasses or TypedDicts from JSON',
    longDescription:
      'Convert JSON to Python dataclass definitions or TypedDict classes. Infers Python types from JSON values and generates clean, importable Python code.',
    icon: 'Py',
    keywords: ['json to python', 'json python dataclass', 'json to python class', 'generate python from json', 'json typeddict'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-typescript', 'json-to-csharp', 'json-formatter'],
    order: 25,
    seoTitle: 'JSON to Python — Generate Python Classes from JSON Online',
    seoDescription:
      'Generate Python dataclasses or TypedDict from JSON. Infers types automatically. Free browser-only JSON to Python converter.',
  },
  {
    id: 'json-to-csharp',
    name: 'JSON to C#',
    slug: 'json-to-csharp',
    category: 'json',
    description: 'Generate C# classes from JSON',
    longDescription:
      'Convert JSON to C# class definitions with proper type inference. Supports System.Text.Json attributes, records, and configurable namespace.',
    icon: 'C#',
    keywords: ['json to csharp', 'json c# class', 'json to c# class', 'generate c# from json', 'json dotnet class'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-typescript', 'json-to-go', 'json-formatter'],
    order: 26,
    seoTitle: 'JSON to C# — Generate C# Classes from JSON Online',
    seoDescription:
      'Generate C# classes from JSON with type inference and System.Text.Json attributes. Free browser-only tool.',
  },
  {
    id: 'json-to-go',
    name: 'JSON to Go',
    slug: 'json-to-go',
    category: 'json',
    description: 'Generate Go structs from JSON',
    longDescription:
      'Convert JSON to Go struct definitions with json tags. Infers Go types from JSON values and generates clean, idiomatic Go code ready to paste into your project.',
    icon: 'Go',
    keywords: ['json to go', 'json go struct', 'go struct from json', 'generate go struct', 'json golang'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-typescript', 'json-to-rust', 'json-formatter'],
    order: 27,
    seoTitle: 'JSON to Go — Generate Go Structs from JSON Online',
    seoDescription:
      'Generate Go structs with json tags from JSON. Infers types automatically. Free browser-only JSON to Go converter.',
  },
  {
    id: 'json-to-kotlin',
    name: 'JSON to Kotlin',
    slug: 'json-to-kotlin',
    category: 'json',
    description: 'Generate Kotlin data classes from JSON',
    longDescription:
      'Convert JSON to Kotlin data class definitions. Supports kotlinx.serialization annotations and nullable fields. Generates idiomatic Kotlin code.',
    icon: 'Kt',
    keywords: ['json to kotlin', 'json kotlin data class', 'kotlin from json', 'json kotlinx serialization'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-typescript', 'json-to-swift', 'json-formatter'],
    order: 28,
    seoTitle: 'JSON to Kotlin — Generate Kotlin Data Classes from JSON',
    seoDescription:
      'Generate Kotlin data classes from JSON with kotlinx.serialization. Free browser-only tool.',
  },
  {
    id: 'json-to-swift',
    name: 'JSON to Swift',
    slug: 'json-to-swift',
    category: 'json',
    description: 'Generate Swift Codable structs from JSON',
    longDescription:
      'Convert JSON to Swift struct definitions conforming to Codable. Generates CodingKeys enums for snake_case to camelCase mapping and supports optional fields.',
    icon: 'Sw',
    keywords: ['json to swift', 'swift codable from json', 'json swift struct', 'swift struct generator', 'ios json model'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-kotlin', 'json-to-typescript', 'json-formatter'],
    order: 29,
    seoTitle: 'JSON to Swift — Generate Swift Codable Structs from JSON',
    seoDescription:
      'Generate Swift Codable structs from JSON. Handles camelCase mapping and optional fields. Free browser-only tool.',
  },
  {
    id: 'json-to-rust',
    name: 'JSON to Rust',
    slug: 'json-to-rust',
    category: 'json',
    description: 'Generate Rust structs with serde from JSON',
    longDescription:
      'Convert JSON to Rust struct definitions using serde for serialization/deserialization. Generates snake_case fields with rename attributes and proper serde derives.',
    icon: 'Rs',
    keywords: ['json to rust', 'rust serde from json', 'json rust struct', 'serde json struct generator', 'rust json model'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-go', 'json-to-typescript', 'json-formatter'],
    order: 30,
    seoTitle: 'JSON to Rust — Generate Rust Serde Structs from JSON',
    seoDescription:
      'Generate Rust structs with serde derives from JSON. Handles snake_case, rename attributes, and nested types. Free browser-only tool.',
  },
  {
    id: 'json-to-php',
    name: 'JSON to PHP',
    slug: 'json-to-php',
    category: 'json',
    description: 'Generate PHP classes or arrays from JSON',
    longDescription:
      'Convert JSON to PHP class definitions with typed properties (PHP 8), PHP array literals, or stdClass patterns. Choose the output style that fits your project.',
    icon: 'PHP',
    keywords: ['json to php', 'json php class', 'php from json', 'json php array', 'php json model'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-python', 'json-to-csharp', 'json-formatter'],
    order: 31,
    seoTitle: 'JSON to PHP — Generate PHP Classes from JSON Online',
    seoDescription:
      'Generate PHP 8 classes, array literals, or stdClass from JSON. Free browser-only JSON to PHP converter.',
  },

  // Data Tools (CSV)
  {
    id: 'csv-formatter',
    name: 'CSV Formatter',
    slug: 'csv-formatter',
    category: 'data',
    description: 'Format and normalize CSV files — headers, quoting, delimiters',
    longDescription:
      'Parse and reformat CSV data consistently. Handles quoted fields, commas inside fields, multiline values, and Unicode. Configurable delimiter. Outputs clean, consistently quoted CSV.',
    icon: ',_,',
    keywords: ['csv', 'format', 'formatter', 'comma', 'delimiter', 'tsv', 'normalize', 'csv formatter', 'csv beautifier'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-to-json', 'json-to-csv', 'csv-validator'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'CSV Formatter — Format & Normalize CSV Online',
    seoDescription:
      'Format and normalize CSV files. Handles quoted fields, multiline values, and custom delimiters. Free online CSV formatter.',
  },
  {
    id: 'csv-validator',
    name: 'CSV Validator',
    slug: 'csv-validator',
    category: 'data',
    description: 'Validate CSV for structural errors — mismatched columns, broken quotes',
    longDescription:
      'Validates CSV structure and reports errors with row and column context. Detects mismatched column counts, broken quotes, malformed multiline fields, and empty inputs. Reports errors like "Row 12: expected 5 columns but found 6."',
    icon: 'CSV✓',
    keywords: ['csv', 'validate', 'validator', 'lint', 'check', 'csv error', 'csv parser', 'csv checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['csv-formatter', 'csv-to-json', 'json-to-csv'],
    isNew: true,
    order: 2,
    seoTitle: 'CSV Validator — Validate and Check CSV Files Online',
    seoDescription:
      'Validate CSV files for errors: mismatched columns, broken quotes, malformed rows. Row-level error reporting. Free, browser-based.',
  },

  // XML Utilities
  {
    id: 'xml-validator',
    name: 'XML Validator',
    slug: 'xml-validator',
    category: 'xml',
    description: 'Validate XML for syntax errors — malformed tags, mismatched elements',
    longDescription:
      'Validates XML using the browser DOMParser. Detects malformed tags, mismatched closing tags, invalid nesting, and declaration errors. Reports the error with context from the browser XML parser.',
    icon: 'XML✓',
    keywords: ['xml', 'validate', 'validator', 'lint', 'check', 'xml error', 'xml syntax', 'xml checker', 'well-formed'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'xml-minifier', 'xml-to-json', 'xml-escape'],
    popular: true,
    isNew: true,
    order: 2,
    seoTitle: 'XML Validator — Validate XML Syntax Online',
    seoDescription:
      'Validate XML syntax and detect errors. Checks for malformed tags, mismatched elements, and invalid nesting. Free, browser-based.',
  },
  {
    id: 'xml-minifier',
    name: 'XML Minifier',
    slug: 'xml-minifier',
    category: 'xml',
    description: 'Remove whitespace from XML while preserving document meaning',
    longDescription:
      'Minifies XML by removing unnecessary whitespace between elements while preserving meaningful text content, CDATA sections, and document structure. Configurable comment preservation.',
    icon: 'XML↓',
    keywords: ['xml', 'minify', 'minifier', 'compress', 'whitespace', 'optimize', 'xml compress'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'xml-validator', 'xml-to-json'],
    isNew: true,
    order: 3,
    seoTitle: 'XML Minifier — Minify XML Online',
    seoDescription:
      'Minify XML by removing unnecessary whitespace. Preserves meaningful text nodes, CDATA, and document structure. Free online XML minifier.',
  },
  {
    id: 'xml-to-json',
    name: 'XML → JSON',
    slug: 'xml-to-json',
    category: 'xml',
    description: 'Convert XML documents to JSON — elements, attributes, text nodes',
    longDescription:
      'Converts XML to JSON using a structured mapping: elements become objects, attributes are prefixed with @, text content uses a #text key, repeated sibling elements become arrays. Handles namespaces, CDATA, and nested structures.',
    icon: 'XML→{}',
    keywords: ['xml to json', 'convert', 'xml json', 'xml2json', 'transform', 'parse xml', 'xml converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['json-to-xml', 'xml-formatter', 'xml-validator', 'json-formatter'],
    popular: true,
    isNew: true,
    order: 4,
    seoTitle: 'XML to JSON Converter — Convert XML to JSON Online',
    seoDescription:
      'Convert XML documents to JSON. Handles elements, attributes, nested structures, and repeated elements. Free, browser-based XML to JSON converter.',
  },
  {
    id: 'xml-escape',
    name: 'XML Escape / Unescape',
    slug: 'xml-escape',
    category: 'xml',
    description: 'Escape or unescape XML special characters — &amp; &lt; &gt; &quot;',
    longDescription:
      'Escape plain text for safe embedding in XML content or attributes, or unescape XML entity references back to raw characters. Handles the 5 predefined XML entities: &amp; &lt; &gt; &quot; &apos;.',
    icon: '&amp;',
    keywords: ['xml escape', 'unescape', 'entities', 'ampersand', 'html entities', 'xml encoding', 'escape xml', 'special characters'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['xml-formatter', 'html-encoder', 'html-decoder', 'json-escape'],
    isNew: true,
    order: 5,
    seoTitle: 'XML Escape / Unescape — Escape XML Special Characters',
    seoDescription:
      'Escape or unescape XML special characters. Handles &amp; &lt; &gt; &quot; &apos; entities. Free online XML escaper.',
  },

  // YAML Utilities
  {
    id: 'yaml-validator',
    name: 'YAML Validator',
    slug: 'yaml-validator',
    category: 'yaml',
    description: 'Validate YAML syntax and detect parse errors',
    longDescription:
      'Validates YAML syntax using js-yaml. Reports syntax errors with line and column context. Supports YAML 1.2 including nested mappings, sequences, anchors, aliases, and multiline scalars.',
    icon: 'YAML✓',
    keywords: ['yaml', 'validate', 'validator', 'lint', 'check', 'yaml syntax', 'yaml error', 'yaml checker'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'yaml-to-json', 'yaml-minifier', 'json-validator'],
    popular: true,
    isNew: true,
    order: 3,
    seoTitle: 'YAML Validator — Validate YAML Syntax Online',
    seoDescription:
      'Validate YAML syntax and detect errors. Supports YAML 1.2, nested structures, anchors, and aliases. Free, browser-based.',
  },
  {
    id: 'yaml-minifier',
    name: 'YAML Minifier',
    slug: 'yaml-minifier',
    category: 'yaml',
    description: 'Minify YAML — produce compact single-line representation',
    longDescription:
      'Parses YAML and serializes it in the most compact valid YAML format using flow style. Preserves all data types including strings, numbers, booleans, null, arrays, and nested mappings.',
    icon: 'YAML↓',
    keywords: ['yaml', 'minify', 'minifier', 'compact', 'flow', 'yaml compress', 'yaml optimize'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['yaml-formatter', 'yaml-validator', 'yaml-to-json'],
    isNew: true,
    order: 4,
    seoTitle: 'YAML Minifier — Minify YAML Online',
    seoDescription:
      'Minify YAML to compact flow style. Preserves all data types and structure. Free online YAML minifier.',
  },

  // Text Tools
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    slug: 'text-case-converter',
    category: 'text',
    description: 'Convert text case — camelCase, snake_case, kebab-case, UPPER, Title, and more',
    longDescription:
      'Convert between 9 text case formats: lowercase, UPPERCASE, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE. Handles Unicode, multiple spaces, and punctuation.',
    icon: 'Aa',
    keywords: ['case converter', 'camelcase', 'snake case', 'kebab case', 'pascal case', 'title case', 'uppercase', 'lowercase', 'text converter'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['word-counter', 'remove-duplicate-lines', 'sort-lines'],
    popular: true,
    isNew: true,
    order: 1,
    seoTitle: 'Text Case Converter — camelCase, snake_case, kebab-case & More',
    seoDescription:
      'Convert text between camelCase, PascalCase, snake_case, kebab-case, UPPER, lower, Title, Sentence, and CONSTANT_CASE. Free online case converter.',
  },
  {
    id: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines',
    slug: 'remove-duplicate-lines',
    category: 'text',
    description: 'Remove duplicate lines from text, keeping only the first occurrence',
    longDescription:
      'Removes duplicate lines from any text input. Keeps the first occurrence, optionally case-insensitive. Preserves original line order. Reports how many duplicates were removed.',
    icon: '≡×',
    keywords: ['duplicate lines', 'remove duplicates', 'unique lines', 'deduplicate', 'text cleaner', 'line deduplication'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['sort-lines', 'text-case-converter', 'word-counter'],
    isNew: true,
    order: 2,
    seoTitle: 'Remove Duplicate Lines — Deduplicate Text Online',
    seoDescription:
      'Remove duplicate lines from text, keeping first occurrences. Optional case-insensitive mode. Free online duplicate line remover.',
  },
  {
    id: 'sort-lines',
    name: 'Sort Lines',
    slug: 'sort-lines',
    category: 'text',
    description: 'Sort lines alphabetically or numerically, ascending or descending',
    longDescription:
      'Sort lines of text alphabetically or numerically, ascending or descending. Optional case-insensitive mode and unique-only filter. Preserves blank lines or removes them as configured.',
    icon: 'A↕Z',
    keywords: ['sort lines', 'alphabetical sort', 'numeric sort', 'line sort', 'text sort', 'arrange lines'],
    enabled: true,
    privacySensitive: true,
    relatedTools: ['remove-duplicate-lines', 'text-case-converter', 'word-counter'],
    isNew: true,
    order: 3,
    seoTitle: 'Sort Lines — Sort Text Lines Online',
    seoDescription:
      'Sort text lines alphabetically or numerically, ascending or descending. Case-insensitive and unique-only options. Free online line sorter.',
  },
];

// ---------------------------------------------------------------------------
// Integrity check — runs once at module init in dev/test
// ---------------------------------------------------------------------------

function assertRegistryIntegrity() {
  if (process.env.NODE_ENV === 'production') return;
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const validCategories = new Set(CATEGORIES.map((c) => c.id));

  for (const tool of TOOLS) {
    if (ids.has(tool.id)) {
      throw new Error(`[registry] Duplicate tool id: "${tool.id}"`);
    }
    if (slugs.has(tool.slug)) {
      throw new Error(`[registry] Duplicate tool slug: "${tool.slug}"`);
    }
    if (!validCategories.has(tool.category)) {
      throw new Error(
        `[registry] Tool "${tool.id}" has unknown category: "${tool.category}"`
      );
    }
    if (!tool.seoTitle) {
      throw new Error(`[registry] Tool "${tool.id}" is missing seoTitle`);
    }
    if (!tool.seoDescription) {
      throw new Error(`[registry] Tool "${tool.id}" is missing seoDescription`);
    }
    ids.add(tool.id);
    slugs.add(tool.slug);
  }
}

assertRegistryIntegrity();

// ---------------------------------------------------------------------------
// Memoized indexes (built once, never rebuilt)
// ---------------------------------------------------------------------------

const byId = new Map<string, ToolDefinition>(TOOLS.map((t) => [t.id, t]));
const bySlug = new Map<string, ToolDefinition>(TOOLS.map((t) => [t.slug, t]));
const byCategory = new Map<ToolCategoryId, ToolDefinition[]>();
const categoryById = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]));
const categoryBySlug = new Map<string, Category>(CATEGORIES.map((c) => [c.slug, c]));

for (const tool of TOOLS) {
  if (!byCategory.has(tool.category)) byCategory.set(tool.category, []);
  byCategory.get(tool.category)!.push(tool);
}

// Pre-build lowercase search tokens for O(n) linear scan with fast string ops
const searchIndex = TOOLS.filter((t) => t.enabled).map((t) => ({
  tool: t,
  tokens: [
    t.name,
    t.slug,
    t.description,
    t.category,
    ...(t.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase(),
}));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllTools(): ToolDefinition[] {
  return TOOLS;
}

export function getEnabledTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.enabled);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return byId.get(id);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return bySlug.get(slug);
}

export function getToolsByCategory(category: ToolCategoryId | string): ToolDefinition[] {
  return (byCategory.get(category as ToolCategoryId) ?? []).filter((t) => t.enabled);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS.filter((t) => t.enabled && t.popular);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return getEnabledTools();
  return searchIndex
    .filter(({ tokens }) => tokens.includes(q) || tokens.split(' ').some((tok) => tok.startsWith(q)) || tokens.includes(q))
    .map(({ tool }) => tool);
}

export function getRelatedTools(tool: ToolDefinition, limit = 4): ToolDefinition[] {
  // 1. Use explicit relatedTools list first
  if (tool.relatedTools && tool.relatedTools.length > 0) {
    const explicit = tool.relatedTools
      .map((id) => getToolById(id))
      .filter((t): t is ToolDefinition => !!t && t.enabled && t.id !== tool.id)
      .slice(0, limit);
    if (explicit.length > 0) return explicit;
  }
  // 2. Fall back to same-category tools
  return getToolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id && t.enabled)
    .slice(0, limit);
}

export function getCategories(): Category[] {
  return CATEGORIES;
}

export const CATEGORY_ORDER = [
  'json',
  'encoding',
  'developer',
  'data-code',
  'utilities',
  'developer-utilities',
  'date-time',
  'regex',
  'sql',
  'xml',
  'yaml',
  'data',
  'text',
] as const;

export function getOrderedCategories(): Category[] {
  const ordered: Category[] = [];
  for (const id of CATEGORY_ORDER) {
    const cat = CATEGORIES.find((c) => c.id === id);
    if (cat) ordered.push(cat);
  }
  // Append any categories not listed in CATEGORY_ORDER
  for (const cat of CATEGORIES) {
    if (!(CATEGORY_ORDER as readonly string[]).includes(cat.id)) {
      ordered.push(cat);
    }
  }
  return ordered;
}

export function getCategoryById(id: string): Category | undefined {
  return categoryById.get(id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

// ---------------------------------------------------------------------------
// Colour helpers (used by UI components)
// ---------------------------------------------------------------------------

export type ColorKey = 'blue' | 'purple' | 'green' | 'orange' | 'gray';

export const CATEGORY_COLORS: Record<
  ColorKey,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
};

export function getCategoryColors(color: string) {
  return CATEGORY_COLORS[color as ColorKey] ?? CATEGORY_COLORS.gray;
}
