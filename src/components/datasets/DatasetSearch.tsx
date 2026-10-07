'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DatasetMeta, DatasetCategory } from '@/types/dataset';
import { DatasetCategoryBadge } from './DatasetCategoryBadge';

interface DatasetSearchProps {
  datasets: DatasetMeta[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ALL_CATEGORY = '__all__' as const;

export function DatasetSearch({ datasets }: DatasetSearchProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DatasetCategory | typeof ALL_CATEGORY>(ALL_CATEGORY);

  const categories = useMemo(() => {
    const seen = new Map<DatasetCategory, number>();
    for (const d of datasets) {
      seen.set(d.category, (seen.get(d.category) ?? 0) + 1);
    }
    return Array.from(seen.entries()).sort((a, b) => b[1] - a[1]);
  }, [datasets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return datasets.filter((d) => {
      const categoryMatch = activeCategory === ALL_CATEGORY || d.category === activeCategory;
      if (!categoryMatch) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q)) ||
        d.category.includes(q)
      );
    });
  }, [datasets, query, activeCategory]);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search datasets by name, category, or tag…"
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label="Search datasets"
            />
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as DatasetCategory | typeof ALL_CATEGORY)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label="Filter by category"
            >
              <option value={ALL_CATEGORY}>All categories ({datasets.length})</option>
              {categories.map(([cat, count]) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-12 text-center">
            No datasets match your search. Try a different term or clear the filter.
          </p>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-400 dark:text-gray-600">
              {filtered.length} {filtered.length === 1 ? 'dataset' : 'datasets'}
              {query ? ` matching "${query}"` : ''}
              {activeCategory !== ALL_CATEGORY ? ` in ${activeCategory}` : ''}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <Link
                  key={d.slug}
                  href={`/datasets/${d.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-shadow hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {d.name}
                    </h3>
                    {d.popular && (
                      <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">
                    {d.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DatasetCategoryBadge category={d.category} />
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      {d.recordCount.toLocaleString()} records
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      {formatBytes(d.fileSizeBytes)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
