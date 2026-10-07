import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';

interface ToolOutputProps {
  value: string;
  label?: string;
  error?: string;
  rows?: number;
  className?: string;
  mono?: boolean;
  showCopy?: boolean;
}

export function ToolOutput({
  value,
  label,
  error,
  rows = 10,
  className,
  mono = true,
  showCopy = true,
}: ToolOutputProps) {
  const minHeight = `${rows * 1.6}rem`;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        )}
        {showCopy && value && !error && <CopyButton text={value} size="sm" />}
      </div>
      <div
        className={cn(
          'relative w-full overflow-auto rounded-lg border px-3 py-2.5 text-sm',
          error
            ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20'
            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50',
          mono && 'font-mono text-xs leading-relaxed',
          className
        )}
        style={{ minHeight }}
      >
        {error ? (
          <span className="text-red-600 dark:text-red-400">{error}</span>
        ) : (
          <pre className="whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
            {value || <span className="text-gray-400 dark:text-gray-600">Output will appear here...</span>}
          </pre>
        )}
      </div>
    </div>
  );
}
