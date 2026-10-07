import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

type ModelHint = 'generic' | 'gpt4' | 'claude';

function getModel(options?: Record<string, unknown>): ModelHint {
  const m = options?.model;
  if (m === 'gpt4' || m === 'claude') return m;
  return 'generic';
}

/**
 * Estimate token count using the chars/4 heuristic.
 * This is the most widely cited rough approximation.
 */
function estimateByChars(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate token count by splitting on word/punctuation boundaries.
 * Each whitespace-separated word contributes ~1 token for common English words,
 * but punctuation, numbers, and special chars may each count as separate tokens.
 * We approximate by splitting on whitespace and then further splitting tokens
 * that contain punctuation sequences.
 */
function estimateByWordSplit(text: string): number {
  // Split on whitespace to get rough "words"
  const rawTokens = text.trim().split(/\s+/).filter(Boolean);

  let count = 0;
  for (const token of rawTokens) {
    // Each contiguous run of word characters counts as one token,
    // each contiguous run of non-word characters counts as one token.
    const parts = token.match(/\w+|\W+/g);
    count += parts ? parts.length : 1;
  }

  return count;
}

function buildReport(
  input: string,
  model: ModelHint,
  charEstimate: number,
  wordEstimate: number,
): string {
  const charCount = input.length;
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  // Choose the displayed primary estimate based on model hint.
  // GPT-4 and Claude are both close to the chars/4 heuristic for JSON payloads;
  // we reflect that with a slight variance to be honest about uncertainty.
  let modelLine = '';
  if (model === 'gpt4') {
    modelLine = `For OpenAI GPT-4: typically ~${charEstimate} tokens`;
  } else if (model === 'claude') {
    modelLine = `For Claude: typically ~${charEstimate} tokens (Claude uses a similar tokenizer)`;
  } else {
    modelLine = `For OpenAI GPT-4: typically ~${charEstimate} tokens\nFor Claude: typically ~${charEstimate} tokens (Claude uses a similar tokenizer)`;
  }

  return [
    '=== Token Count Estimates ===',
    `Characters: ${charCount}`,
    `Words: ${wordCount}`,
    '',
    `Estimate (chars ÷ 4): ~${charEstimate} tokens`,
    `Estimate (word-split): ~${wordEstimate} tokens`,
    '',
    'Note: These are approximations. Actual token counts vary by model and tokenizer.',
    modelLine,
  ].join('\n');
}

export const jsonTokenCounterProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: '{"key": "value", ...}',
  autoProcess: true,

  exampleInput: JSON.stringify(
    {
      id: 'usr_7a3f9c12',
      name: 'Alice Nguyen',
      email: 'alice.nguyen@example.com',
      age: 31,
      active: true,
      role: 'admin',
      createdAt: '2024-03-15T08:22:00Z',
      tags: ['developer', 'reviewer'],
      address: {
        city: 'San Francisco',
        country: 'US',
      },
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
    null,
    2,
  ),

  optionControls: [
    {
      key: 'model',
      type: 'select',
      label: 'Model hint',
      defaultValue: 'generic',
      options: [
        { value: 'generic', label: 'Generic (show both)' },
        { value: 'gpt4', label: 'OpenAI GPT-4' },
        { value: 'claude', label: 'Claude' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste JSON to count tokens.' };

    // Validate JSON so we surface parse errors clearly.
    try {
      JSON.parse(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Invalid JSON: ${msg}` };
    }

    const model = getModel(input.options);
    const charEstimate = estimateByChars(raw);
    const wordEstimate = estimateByWordSplit(raw);

    const report = buildReport(raw, model, charEstimate, wordEstimate);

    return {
      output: {
        value: report,
        type: 'text',
        label: 'Approximate Token Count',
        copyable: true,
      },
      meta: {
        characters: raw.length,
        'chars÷4 estimate': charEstimate,
        'word-split estimate': wordEstimate,
      },
    };
  },
};
