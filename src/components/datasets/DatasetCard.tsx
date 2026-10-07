import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DatasetMeta } from '@/types/dataset';
import { DatasetCategoryBadge } from './DatasetCategoryBadge';

interface DatasetCardProps {
  dataset: DatasetMeta;
  className?: string;
}

function formatRecordCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M records`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K records`;
  return `${count} records`;
}

export function DatasetCard({ dataset, className }: DatasetCardProps) {
  return (
    <Link
      href={`/datasets/${dataset.slug}`}
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
        <DatasetCategoryBadge category={dataset.category} />
        <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
          {formatRecordCount(dataset.recordCount)}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {dataset.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {dataset.description}
        </p>
      </div>

      {dataset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {dataset.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-xs bg-gray-50 text-gray-500 dark:bg-gray-800/60 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
