import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { dump, YAMLException } from 'js-yaml';

export const jsonToYamlProcessor: ToolProcessor = {
  inputLabel: 'JSON Input',
  inputPlaceholder: 'Paste JSON here…',
  autoProcess: true,
  exampleInput: JSON.stringify(
    {
      name: 'DevToolsHub',
      version: '1.0.0',
      features: ['json', 'yaml', 'xml', 'csv'],
      settings: {
        enabled: true,
        debug: false,
        maxRetries: 3,
      },
      description: null,
    },
    null,
    2
  ),

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
    if (!raw) return { error: 'Paste JSON to convert.' };

    const indent = parseInt(String(input.options?.['indent'] ?? '2'), 10);
    const sortKeys = Boolean(input.options?.['sortKeys'] ?? false);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: 'Invalid JSON — please check your input.' };
    }

    let yaml: string;
    try {
      yaml = dump(parsed, {
        indent,
        sortKeys,
        noRefs: true,
        lineWidth: -1,
      });
    } catch (err) {
      if (err instanceof YAMLException) {
        return { error: `YAML serialization failed: ${err.message.split('\n')[0]}` };
      }
      return { error: 'Failed to convert to YAML.' };
    }

    return {
      output: {
        value: yaml.trimEnd(),
        type: 'text',
        label: 'YAML Output',
        copyable: true,
        downloadFilename: 'output.yaml',
        downloadMime: 'text/yaml',
      },
      meta: {
        indent: `${indent} spaces`,
        'input bytes': raw.length,
        'output bytes': yaml.length,
      },
    };
  },
};
