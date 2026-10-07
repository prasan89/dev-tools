import type { Metadata } from 'next';
import Link from 'next/link';
import { getEnabledTools, getCategories } from '@/lib/registry';

export const metadata: Metadata = {
  title: 'Page Not Found | DevToolsHub',
  description: 'The page you were looking for could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const popularTools = getEnabledTools().filter(t => t.popular).slice(0, 6);
  const categories = getCategories().slice(0, 8);

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 text-center">
      {/* 404 hero */}
      <div className="mb-12">
        <p className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The page you were looking for does not exist or has been moved.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">
          ← Back to home
        </Link>
      </div>

      {/* Popular tools */}
      {popularTools.length > 0 && (
        <section className="mb-10 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Popular Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularTools.map(tool => (
              <Link key={tool.id} href={`/tools/${tool.slug}`}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all">
                <span className="mr-2">{tool.icon}</span>{tool.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="text-left">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Browse by Category
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Link key={cat.id} href={`/tools/category/${cat.slug}`}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 transition-colors">
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
