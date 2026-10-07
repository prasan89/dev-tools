import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { buildCron, describeCron, getNextExecutions, validateCron } from '../datetime/cron';

export const cronGeneratorProcessor: ToolProcessor = {
  inputLabel: 'Preset or describe what you want (optional)',
  inputPlaceholder: 'Every weekday at 9am',
  exampleInput: 'Every weekday at 9am',
  autoProcess: true,

  optionControls: [
    {
      key: 'minute',
      type: 'text',
      label: 'Minute (0-59, * or */n)',
      defaultValue: '0',
      placeholder: '0',
    },
    {
      key: 'hour',
      type: 'text',
      label: 'Hour (0-23, * or */n)',
      defaultValue: '9',
      placeholder: '9',
    },
    {
      key: 'dayOfMonth',
      type: 'text',
      label: 'Day of Month (1-31, *)',
      defaultValue: '*',
      placeholder: '*',
    },
    {
      key: 'month',
      type: 'text',
      label: 'Month (1-12, *)',
      defaultValue: '*',
      placeholder: '*',
    },
    {
      key: 'dayOfWeek',
      type: 'text',
      label: 'Day of Week (0-7, * or 1-5)',
      defaultValue: '*',
      placeholder: '* (0=Sun, 7=Sun)',
    },
  ],

  process(input: ToolInput): ToolResult {
    const minute = String(input.options?.minute ?? '0').trim() || '0';
    const hour = String(input.options?.hour ?? '9').trim() || '9';
    const dayOfMonth = String(input.options?.dayOfMonth ?? '*').trim() || '*';
    const month = String(input.options?.month ?? '*').trim() || '*';
    const dayOfWeek = String(input.options?.dayOfWeek ?? '*').trim() || '*';

    const expression = buildCron({ minute, hour, dayOfMonth, month, dayOfWeek });

    const validation = validateCron(expression);
    if (!validation.valid) {
      return {
        error: `Invalid cron expression: ${validation.error}\nExpression: ${expression}`,
      };
    }

    const description = describeCron(expression);
    const now = new Date();
    const nextRuns = getNextExecutions(expression, now, 5);

    const lines: string[] = [];
    lines.push('Cron Expression Generator');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`Expression:   ${expression}`);
    lines.push(`Description:  ${description}`);
    lines.push('');
    lines.push('Field Breakdown:');
    lines.push('─'.repeat(40));
    lines.push(`  Minute:        ${minute}`);
    lines.push(`  Hour:          ${hour}`);
    lines.push(`  Day of Month:  ${dayOfMonth}`);
    lines.push(`  Month:         ${month}`);
    lines.push(`  Day of Week:   ${dayOfWeek}  (0=Sun, 1=Mon, …, 6=Sat, 7=Sun)`);
    lines.push('');
    lines.push('Next 5 Executions (UTC):');
    lines.push('─'.repeat(40));

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
        label: `Cron: ${expression}`,
        copyable: true,
      },
      meta: {
        expression,
        description,
      },
    };
  },
};
