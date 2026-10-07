import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { ToolCard } from '@/components/ui/ToolCard';
import { DatasetCard } from '@/components/datasets/DatasetCard';
import { getCategories, getEnabledTools, getPopularTools, getToolsByCategory } from '@/lib/registry';
import { getPopularDatasets } from '@/lib/datasets';
import { JsonLd, websiteSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'DevToolsHub — Developer Tools That Just Work',
  description:
    'Fast, free, privacy-friendly tools for developers. JSON formatter, Base64 encoder, regex tester, UUID generator, diff checker, and more.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const popularTools = getPopularTools();
  const allTools = getEnabledTools().slice(0, 24);
  const totalTools = getEnabledTools().length;
  const categories = getCategories();
  const popularDatasets = getPopularDatasets(6);

  return (
    <>
      <JsonLd data={websiteSchema()} />
      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Developer Tools That Just Work
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            Fast, free, privacy-friendly tools for developers.
          </p>
          <div className="mt-6 max-w-lg mx-auto">
            <SearchBar
              size="large"
              placeholder={`Search ${totalTools}+ tools…`}
            />
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
            All processing happens in your browser — nothing is sent to our servers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
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

        {/* Popular tools */}
        <section aria-labelledby="popular-heading">
          <h2
            id="popular-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Popular Tools
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {popularTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Popular Datasets */}
        <section aria-labelledby="datasets-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="datasets-heading" className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Free JSON Datasets
            </h2>
            <Link href="/datasets" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {popularDatasets.map(d => <DatasetCard key={d.slug} dataset={d} />)}
          </div>
        </section>

        {/* All tools */}
        <section aria-labelledby="all-tools-heading">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="all-tools-heading"
              className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              All Tools
            </h2>
            <Link href="/tools" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View all {totalTools} tools →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {allTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/tools"
              className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all {totalTools} tools →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
