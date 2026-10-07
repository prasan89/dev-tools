import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { load, dump, YAMLException } from 'js-yaml';

export const yamlMinifierProcessor: ToolProcessor = {
  inputLabel: 'YAML Input',
  inputPlaceholder: 'Paste your YAML to minify…',
  autoProcess: true,
  exampleInput: `name: DevToolsHub
version: 1.0
tools:
  - name: JSON Formatter
    enabled: true
  - name: YAML Formatter
    enabled: true
settings:
  debug: false
  maxItems: 100`,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste YAML to minify.' };

    let parsed: unknown;
    try {
      parsed = load(raw);
    } catch (err) {
      if (err instanceof YAMLException) {
        const loc = err.mark ? ` (line ${err.mark.line + 1})` : '';
        return { error: `Invalid YAML${loc}:\n\n${err.reason ?? err.message}` };
      }
      return { error: `YAML parse error:\n\n${err instanceof Error ? err.message : String(err)}` };
    }

    // Dump in flow style (most compact valid YAML)
    const minified = dump(parsed, {
      flowLevel: 0,      // use flow style at all levels
      lineWidth: -1,     // no line wrapping
      indent: 2,
    }).trim();

    const savings = Math.round((1 - minified.length / raw.length) * 100);

    return {
      output: {
        value: minified,
        type: 'text',
        label: 'Minified YAML',
        copyable: true,
        downloadFilename: 'minified.yaml',
        downloadMime: 'application/x-yaml',
      },
      meta: {
        'original bytes': raw.length,
        'minified bytes': minified.length,
        savings: `${savings}%`,
      },
    };
  },
};
