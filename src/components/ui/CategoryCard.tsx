import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCategoryColors } from '@/lib/registry';
import { Category } from '@/types/tool';

interface CategoryCardProps {
  category: Category;
  toolCount?: number;
  className?: string;
}

export function CategoryCard({ category, toolCount, className }: CategoryCardProps) {
  const colors = getCategoryColors(category.color);

  return (
    <Link
      href={`/tools/category/${category.slug}`}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border p-5',
        colors.border,
        colors.bg,
        'hover:shadow-sm transition-all',
        className
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold',
          'bg-white dark:bg-gray-900',
          colors.text
        )}
        aria-hidden="true"
      >
        {category.icon}
      </span>
      <div>
        <h3 className={cn('font-semibold text-sm', colors.text, 'group-hover:underline')}>
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{category.description}</p>
      </div>
      {toolCount !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-500">{toolCount} tools</span>
      )}
    </Link>
  );
}
