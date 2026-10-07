import { cn } from '@/lib/utils';
import { DatasetCategory } from '@/types/dataset';

interface DatasetCategoryBadgeProps {
  category: DatasetCategory;
  className?: string;
}

const categoryStyles: Record<DatasetCategory, string> = {
  geographic: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  reference: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  configuration: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  testing: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  'api-mocks': 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  technology: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
  ecommerce: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
  education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  entertainment: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  science: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  utilities: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const categoryLabels: Record<DatasetCategory, string> = {
  geographic: 'Geographic',
  reference: 'Reference',
  configuration: 'Configuration',
  testing: 'Testing',
  'api-mocks': 'API Mocks',
  technology: 'Technology',
  ecommerce: 'Ecommerce',
  finance: 'Finance',
  social: 'Social',
  education: 'Education',
  entertainment: 'Entertainment',
  science: 'Science',
  utilities: 'Utilities',
};

export function DatasetCategoryBadge({ category, className }: DatasetCategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        categoryStyles[category],
        className
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}
