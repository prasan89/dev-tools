import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { load, dump, YAMLException } from 'js-yaml';

export const yamlFormatterProcessor: ToolProcessor = {
  inputLabel: 'YAML Input',
  inputPlaceholder: 'Paste your YAML here…',
  autoProcess: true,
  exampleInput: `name: DevToolsHub\ntools:\n- json\n- yaml\n- xml\nsettings:\n  enabled: true\n  version: 1`,

  optionControls: [
    {
      key: 'indent',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
    {
      key: 'sortKeys',
      type: 'checkbox',
      label: 'Sort keys',
      defaultValue: false,
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste YAML to format.' };

    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);
    const sortKeys = Boolean(input.options?.['sortKeys'] ?? false);

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

    let formatted: string;
    try {
      formatted = dump(parsed, {
        indent,
        sortKeys,
        noRefs: true,
        lineWidth: -1,
      });
    } catch {
      return { error: 'Failed to format YAML.' };
    }

    return {
      output: {
        value: formatted.trimEnd(),
        type: 'text',
        label: 'Formatted YAML',
        copyable: true,
        downloadFilename: 'formatted.yaml',
        downloadMime: 'text/yaml',
      },
      meta: {
        indent: `${indent} spaces`,
        'input bytes': raw.length,
        'output bytes': formatted.length,
      },
    };
  },
};
