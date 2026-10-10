import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { getOrderedCategories, getEnabledTools, getToolsByCategory, getCategoryColors } from '@/lib/registry';
import { JsonLd, websiteSchema } from '@/components/seo/JsonLd';
import { Footer } from '@/components/layout/Footer';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'DevToolsHub — Free Online Developer & PDF Tools',
  description:
    'Free online tools for developers and everyday tasks. JSON formatter, Base64 encoder, URL encoder, regex tester, PDF merger, PDF compressor and 80+ more tools — all run in your browser, nothing uploaded.',
  alternates: { canonical: siteUrl('/') },
  openGraph: {
    title: 'DevToolsHub — Free Online Developer & PDF Tools',
    description:
      'Free online tools for developers and everyday tasks. JSON formatter, Base64 encoder, URL encoder, regex tester, PDF merger, PDF compressor and 80+ more tools — all run in your browser, nothing uploaded.',
    url: siteUrl('/'),
    siteName: 'DevToolsHub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevToolsHub — Free Online Developer & PDF Tools',
    description:
      'Free online tools for developers and everyday tasks. 80+ tools run entirely in your browser.',
  },
};

export default function HomePage() {
  const categories = getOrderedCategories();
  const totalTools = getEnabledTools().length;
  const pdfColors = getCategoryColors('orange');

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Free Online Developer &amp; PDF Tools
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            JSON, Base64, URL encoding, regex, SQL, XML, YAML, PDF tools and more — fast, free, and privacy-friendly.
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Browse by Category */}
        <section aria-labelledby="categories-heading">
          <h2
            id="categories-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {/* PDF Tools — always first */}
            <Link
              href="/pdf-tools"
              prefetch={false}
              className={`group flex flex-col gap-3 rounded-xl border p-5 ${pdfColors.border} ${pdfColors.bg} hover:shadow-sm transition-all`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold bg-white dark:bg-gray-900 ${pdfColors.text}`}
                aria-hidden="true"
              >
                📄
              </span>
              <div>
                <h3 className={`font-semibold text-sm ${pdfColors.text} group-hover:underline`}>
                  PDF Tools
                </h3>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                  Merge, split, compress, convert and edit PDFs — free and private
                </p>
              </div>
            </Link>

            <Link
              href="/calculators"
              className="group flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 transition-all hover:shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-bold text-emerald-700 dark:bg-gray-900 dark:text-emerald-300" aria-hidden="true">∑</span>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 group-hover:underline dark:text-emerald-300">Calculators</h3>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">75 free finance, health, math and everyday calculators</p>
              </div>
            </Link>

            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                toolCount={getToolsByCategory(cat.id).length}
              />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
