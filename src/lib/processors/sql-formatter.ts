import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';
import { format } from 'sql-formatter';

type SqlLanguage = 'sql' | 'mysql' | 'postgresql' | 'transactsql' | 'sqlite';

const DIALECT_LABELS: Record<SqlLanguage, string> = {
  sql: 'Generic SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  transactsql: 'SQL Server',
  sqlite: 'SQLite',
};

export const sqlFormatterProcessor: ToolProcessor = {
  inputLabel: 'SQL Query',
  inputPlaceholder: 'Paste your SQL query here…',
  autoProcess: true,
  exampleInput: `SELECT u.id,u.name,u.email,o.total,o.created_at FROM users u JOIN orders o ON u.id=o.user_id WHERE o.total>100 AND u.active=1 ORDER BY o.total DESC LIMIT 20;`,

  optionControls: [
    {
      key: 'dialect',
      type: 'select',
      label: 'Dialect',
      defaultValue: 'sql',
      options: Object.entries(DIALECT_LABELS).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'tabWidth',
      type: 'select',
      label: 'Indent',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
    {
      key: 'keywordCase',
      type: 'select',
      label: 'Keywords',
      defaultValue: 'upper',
      options: [
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'lower', label: 'lowercase' },
        { value: 'preserve', label: 'Preserve' },
      ],
    },
  ],

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a SQL query to format.' };

    const opts = input.options ?? {};
    const dialect = (opts['dialect'] as SqlLanguage | undefined) ?? 'sql';
    const tabWidth = parseInt(String(opts['tabWidth'] ?? '2'), 10);
    const keywordCase = (opts['keywordCase'] as 'upper' | 'lower' | 'preserve' | undefined) ?? 'upper';

    let formatted: string;
    try {
      formatted = format(raw, {
        language: dialect,
        tabWidth,
        keywordCase,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'SQL formatting failed';
      // Strip any internal stack trace, show only first sentence
      const clean = msg.split('\n')[0];
      return { error: `Could not format SQL: ${clean}` };
    }

    return {
      output: {
        value: formatted,
        type: 'text',
        label: 'Formatted SQL',
        copyable: true,
        downloadFilename: 'formatted.sql',
        downloadMime: 'text/plain',
      },
      meta: {
        dialect: DIALECT_LABELS[dialect] ?? dialect,
        indent: `${tabWidth} spaces`,
        keywords: keywordCase,
      },
    };
  },
};
