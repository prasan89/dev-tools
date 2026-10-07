import type { Metadata } from 'next';
import { ToolCard } from '@/components/ui/ToolCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { getEnabledTools, getCategories, getToolsByCategory } from '@/lib/registry';

export const metadata: Metadata = {
  title: 'All Tools — DevToolsHub',
  description:
    'Browse all free developer tools: JSON formatter, Base64 encoder, regex tester, UUID generator, diff checker, and many more.',
  alternates: { canonical: '/tools' },
};

export default function AllToolsPage() {
  const allTools = getEnabledTools();
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          All Tools
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {allTools.length} free, privacy-friendly developer tools.
        </p>
        <div className="mt-4 max-w-lg">
          <SearchBar placeholder={`Search ${allTools.length}+ tools…`} />
        </div>
      </div>

      {/* Categories */}
      <section aria-labelledby="categories-heading">
        <h2
          id="categories-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              toolCount={getToolsByCategory(cat.id).length}
            />
          ))}
        </div>
      </section>

      {/* All tools grid */}
      <section aria-labelledby="all-tools-heading">
        <h2
          id="all-tools-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          All {allTools.length} Tools
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {allTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
