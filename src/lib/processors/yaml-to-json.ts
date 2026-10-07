import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { load, YAMLException } from 'js-yaml';

export const yamlToJsonProcessor: ToolProcessor = {
  inputLabel: 'YAML Input',
  inputPlaceholder: 'Paste your YAML here…',
  autoProcess: true,
  exampleInput: `name: DevToolsHub\nversion: 1\ntools:\n  - json\n  - yaml\n  - xml\nsettings:\n  enabled: true\n  debug: false`,

  optionControls: [
    {
      key: 'indent',
      type: 'select',
      label: 'JSON indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: '0', label: 'Compact' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste YAML to convert.' };

    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);

    let parsed: unknown;
    try {
      // js-yaml v5 load() uses DEFAULT_SCHEMA by default — safe, no arbitrary constructors
      parsed = load(raw);
    } catch (err) {
      if (err instanceof YAMLException) {
        const { message, mark } = err;
        const location = mark ? ` (line ${mark.line + 1}, column ${mark.column + 1})` : '';
        const clean = message.split('\n')[0];
        return { error: `Invalid YAML${location}:\n\n${clean}` };
      }
      return { error: 'Failed to parse YAML.' };
    }

    // YAML documents may be scalars — JSON.stringify handles all types
    let json: string;
    try {
      json = JSON.stringify(parsed, null, indent === 0 ? undefined : indent);
    } catch (err) {
      return { error: 'Failed to convert to JSON — the YAML document contains values that cannot be serialised.' };
    }

    if (json === undefined) {
      return { error: 'YAML document produced an undefined value. Only objects, arrays, strings, numbers, booleans, and null are supported.' };
    }

    return {
      output: {
        value: json,
        type: 'json',
        label: 'JSON Output',
        copyable: true,
        downloadFilename: 'output.json',
        downloadMime: 'application/json',
      },
      meta: {
        'input bytes': raw.length,
        'output bytes': json.length,
        indent: indent === 0 ? 'compact' : `${indent} spaces`,
      },
    };
  },
};
