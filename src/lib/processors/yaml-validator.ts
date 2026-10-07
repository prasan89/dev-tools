import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { load, YAMLException } from 'js-yaml';

export const yamlValidatorProcessor: ToolProcessor = {
  inputLabel: 'YAML Input',
  inputPlaceholder: 'Paste your YAML here to validate…',
  autoProcess: true,
  exampleInput: `name: DevToolsHub
version: 1.0
tools:
  - name: YAML Formatter
    enabled: true
  - name: JSON Formatter
    enabled: true
settings:
  debug: false
  maxItems: 100`,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste YAML to validate.' };

    try {
      const parsed = load(raw);

      const type = Array.isArray(parsed) ? 'array' : typeof parsed;
      const lines = raw.split('\n').length;

      return {
        output: {
          value: `✓ Valid YAML\n\nRoot type: ${type}\nLines: ${lines}`,
          type: 'text',
          label: 'Validation Result',
          copyable: true,
        },
        meta: {
          valid: 'yes',
          'root type': type,
          lines,
        },
      };
    } catch (err) {
      if (err instanceof YAMLException) {
        const loc = err.mark
          ? ` (line ${err.mark.line + 1}, column ${err.mark.column + 1})`
          : '';
        return {
          output: {
            value: `✗ Invalid YAML${loc}\n\n${err.reason ?? err.message}`,
            type: 'text',
            label: 'Validation Error',
            copyable: true,
          },
          meta: { valid: 'no' },
        };
      }
      return { error: `YAML parse error:\n\n${err instanceof Error ? err.message : String(err)}` };
    }
  },
};
