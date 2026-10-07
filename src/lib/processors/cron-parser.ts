import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { validateCron, parseCron, describeCron, getNextExecutions } from '../datetime/cron';

const FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'] as const;
const FIELD_LABELS: Record<string, string> = {
  minute: 'Minute       (0-59)',
  hour: 'Hour         (0-23)',
  dayOfMonth: 'Day of Month (1-31)',
  month: 'Month        (1-12)',
  dayOfWeek: 'Day of Week  (0-6, 0=Sun)',
};

function describeField(raw: string, fieldName: string): string {
  const lower = raw.toLowerCase();
  if (lower === '*') return `every ${fieldName.replace('Of', ' of ')}`;
  if (/^\*\/\d+$/.test(lower)) {
    const step = raw.split('/')[1];
    return `every ${step} ${fieldName.replace('Of', ' of ')}(s)`;
  }
  if (/^\d+-\d+$/.test(lower)) {
    const [a, b] = raw.split('-');
    return `${a} through ${b}`;
  }
  if (/^\d+-\d+\/\d+$/.test(lower)) {
    const [range, step] = raw.split('/');
    const [a, b] = range.split('-');
    return `${a} through ${b}, every ${step}`;
  }
  if (raw.includes(',')) {
    return `values: ${raw}`;
  }
  return `exactly ${raw}`;
}

export const cronParserProcessor: ToolProcessor = {
  inputLabel: 'Cron Expression (5 fields)',
  inputPlaceholder: '0 9 * * 1-5',
  exampleInput: '0 9 * * 1-5',
  autoProcess: true,

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Enter a cron expression (e.g. 0 9 * * 1-5).' };

    const validation = validateCron(raw);
    if (!validation.valid) {
      // Provide field-level diagnostics
      const fields = raw.trim().split(/\s+/);
      let fieldHint = '';
      if (fields.length === 5) {
        const fieldErrors: string[] = [];
        const specs = [
          { name: 'minute', min: 0, max: 59 },
          { name: 'hour', min: 0, max: 23 },
          { name: 'day-of-month', min: 1, max: 31 },
          { name: 'month', min: 1, max: 12 },
          { name: 'day-of-week', min: 0, max: 7 },
        ];
        fields.forEach((f, i) => {
          const num = parseInt(f);
          if (!isNaN(num) && (num < specs[i].min || num > specs[i].max)) {
            fieldErrors.push(
              `Field ${i + 1} (${specs[i].name}): value ${num} is outside allowed range [${specs[i].min}-${specs[i].max}]`
            );
          }
        });
        if (fieldErrors.length > 0) {
          fieldHint = '\n\nField errors:\n' + fieldErrors.map(e => `  • ${e}`).join('\n');
        }
      } else {
        fieldHint = `\n\nCron must have exactly 5 fields; found ${fields.length}.\nFormat: minute hour day-of-month month day-of-week`;
      }
      return { error: `Invalid cron expression: ${validation.error}${fieldHint}` };
    }

    const description = describeCron(raw);
    const parsed = parseCron(raw);
    const fields = raw.trim().split(/\s+/);
    const now = new Date();
    const nextRuns = getNextExecutions(raw, now, 5);

    const lines: string[] = [];
    lines.push('Cron Expression Parser');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`Expression:   ${raw}`);
    lines.push(`Description:  ${description}`);
    lines.push('');
    lines.push('Field Breakdown:');
    lines.push('─'.repeat(60));

    FIELD_NAMES.forEach((fieldKey, i) => {
      const field = parsed[fieldKey];
      const label = FIELD_LABELS[fieldKey];
      const fieldDesc = describeField(field.raw, fieldKey);
      const valuesPreview = field.values.length <= 10
        ? `[${field.values.join(', ')}]`
        : `[${field.values.slice(0, 8).join(', ')}, … (${field.values.length} total)]`;
      lines.push(`  ${label.padEnd(28)}  "${fields[i].padEnd(6)}"  → ${fieldDesc}`);
      lines.push(`  ${''.padEnd(28)}  values: ${valuesPreview}`);
    });

    lines.push('');
    lines.push('Next 5 Executions (UTC):');
    lines.push('─'.repeat(60));

    if (nextRuns.length === 0) {
      lines.push('  (No upcoming executions found within 4 years)');
    } else {
      nextRuns.forEach((d, i) => {
        lines.push(`  ${i + 1}. ${d.toUTCString()}`);
      });
    }

    return {
      output: {
        value: lines.join('\n'),
        type: 'text',
        label: `Parsed: ${raw}`,
        copyable: true,
      },
      meta: {
        expression: raw,
        description,
        'next run': nextRuns[0]?.toUTCString() || 'n/a',
      },
    };
  },
};
