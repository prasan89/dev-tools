import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tool } from '@/types/tool';

interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        'group flex flex-col gap-2 rounded-xl border p-4',
        'border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900',
        'hover:border-blue-300 dark:hover:border-blue-700',
        'hover:shadow-sm',
        'transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold
            bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          aria-hidden="true"
        >
          {tool.icon}
        </span>
        {(tool.popular || tool.isNew) && (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-xs font-medium',
              tool.isNew
                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
            )}
          >
            {tool.isNew ? 'New' : 'Popular'}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tool.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
