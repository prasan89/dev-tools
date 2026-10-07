// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type ToolCategoryId =
  | 'json'
  | 'encoding'
  | 'developer'
  | 'developer-utilities'
  | 'date-time'
  | 'data-code'
  | 'data'
  | 'utilities'
  | 'regex'
  | 'sql'
  | 'xml'
  | 'yaml';

export interface Category {
  id: ToolCategoryId;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** URL slug for the category page: /tools/[slug] */
  slug: string;
}

// ---------------------------------------------------------------------------
// Processor abstraction
// ---------------------------------------------------------------------------

export interface ToolInput {
  /** Primary text/binary input */
  value: string;
  /** Optional secondary input (e.g. diff checker, key+value) */
  secondary?: string;
  /** Any extra per-processor options */
  options?: Record<string, unknown>;
}

export type ToolOutputType = 'text' | 'json' | 'html' | 'binary';

export interface ToolOutput {
  value: string;
  type: ToolOutputType;
  /** Human-readable label for the output panel */
  label?: string;
  /** Whether the output can be copied */
  copyable?: boolean;
  /** Filename for the download button (omit to disable download) */
  downloadFilename?: string;
  /** MIME type for download */
  downloadMime?: string;
}

export interface ToolWarning {
  message: string;
}

export interface ToolResult {
  output?: ToolOutput;
  /** Secondary / additional outputs (e.g. stats panel alongside main output) */
  additionalOutputs?: ToolOutput[];
  error?: string;
  warnings?: ToolWarning[];
  /** Structured metadata about the result (word count, byte size, etc.) */
  meta?: Record<string, string | number>;
}

// Declarative UI controls rendered above the action bar.
// Values are collected and passed into ToolInput.options.
export type ToolOptionControlType = 'checkbox' | 'select';

export interface ToolOptionControl {
  key: string;
  type: ToolOptionControlType;
  label: string;
  defaultValue: string | boolean;
  // For select only
  options?: Array<{ value: string; label: string }>;
  // Checkbox group heading (optional, for visual grouping)
  group?: string;
}

export interface ToolProcessor {
  /**
   * Run the tool. Called entirely in the browser — MUST be pure / side-effect-free.
   * Throwing is allowed; the caller wraps in try/catch and surfaces the error.
   */
  process(input: ToolInput): ToolResult;
  /** Human label for the primary input textarea */
  inputLabel?: string;
  /** Placeholder text for the primary input textarea */
  inputPlaceholder?: string;
  /** Whether to show a secondary input */
  hasSecondaryInput?: boolean;
  /** Label for the secondary input */
  secondaryInputLabel?: string;
  /** Whether to run processing automatically on input change (default: true) */
  autoProcess?: boolean;
  /** Example input value for "Load Example" button */
  exampleInput?: string;
  /** Example secondary input value for "Load Example" button (dual-input tools) */
  exampleSecondary?: string;
  /** Declarative option controls rendered above the action bar */
  optionControls?: ToolOptionControl[];
}

// ---------------------------------------------------------------------------
// Tool definition
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  /** Stable, unique identifier (use slug form: 'json-formatter') */
  id: string;
  name: string;
  /** URL slug — MUST match id for registry consistency */
  slug: string;
  category: ToolCategoryId;
  /** One-sentence description for cards, search results, meta */
  description: string;
  /** Optional extended description shown on the tool page below the title */
  longDescription?: string;
  /** Icon character/emoji/abbreviation shown in the card icon box */
  icon: string;
  /** Search keywords */
  keywords: string[];
  /** Whether the tool is visible/accessible. Disabled tools are excluded from routes, search, sitemap. */
  enabled: boolean;
  /** Whether this is a privacy-sensitive tool (shows local-processing notice) */
  privacySensitive?: boolean;
  /** Explicit related tool IDs (falls back to same-category tools) */
  relatedTools?: string[];
  /** SEO page title (without site suffix) */
  seoTitle: string;
  /** SEO meta description */
  seoDescription: string;
  /** Show in Popular Tools section */
  popular?: boolean;
  /** Show "New" badge */
  isNew?: boolean;
  /** Display order within category (lower = first) */
  order?: number;
}

// ---------------------------------------------------------------------------
// Legacy alias — kept for backward compat with any callers that imported `Tool`
// ---------------------------------------------------------------------------
export type Tool = ToolDefinition;
