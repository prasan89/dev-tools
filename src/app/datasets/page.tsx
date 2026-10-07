import type { Metadata } from 'next';
import { getDatasets, getCategories } from '@/lib/datasets';
import { DatasetSearch } from '@/components/datasets/DatasetSearch';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: { absolute: 'Free JSON Datasets – Download JSON Data | DevToolsHub' },
  description:
    'Free JSON datasets for testing, development, learning, API prototypes and application development. 100+ datasets across 13 categories.',
  alternates: { canonical: '/datasets' },
  openGraph: {
    title: 'Free JSON Datasets – Download JSON Data | DevToolsHub',
    description:
      'Free JSON datasets for testing, development, learning, API prototypes and application development. 100+ datasets across 13 categories.',
    url: '/datasets',
    type: 'website',
  },
};

function datasetCollectionSchema(count: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: 'DevToolsHub JSON Datasets',
    description: 'Free JSON datasets for testing, development, and API prototyping.',
    url: siteUrl('/datasets'),
    numberOfItems: count,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  };
}

export default function DatasetsPage() {
  const datasets = getDatasets();
  const categories = getCategories();
  const popularCategories = categories.slice(0, 6);

  return (
    <>
      <JsonLd data={datasetCollectionSchema(datasets.length)} />

      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Free JSON Datasets
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Ready-to-use JSON data for testing, prototyping, and learning. Browse, preview, and
            download — no sign-up required.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8-4s8 1.79 8 4" />
            </svg>
            {datasets.length} datasets across {categories.length} categories
          </div>
        </div>
      </section>

      {/* Search + grid (client island) */}
      <DatasetSearch datasets={datasets} />

      {/* SEO content */}
      <section className="bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              What are these datasets?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              These are static JSON files covering geography, reference data, e-commerce, finance,
              social data, science, and more. Each dataset is clean, structured, and ready to drop
              into a project. They are useful as seed data for databases, mock responses for APIs,
              test fixtures for automated tests, and sample data for demos and tutorials.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              How to use
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Open any dataset page to preview its records and fields. Use the Download button to
              save the full JSON file, or Copy to grab it directly to your clipboard. Every dataset
              page also shows the field schema so you know exactly what to expect before importing
              it into your project.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Popular categories
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {popularCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base" aria-hidden="true">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {cat.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              License
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Most datasets are released under{' '}
              <a
                href="https://creativecommons.org/publicdomain/zero/1.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                CC0 (Public Domain)
              </a>
              . Configuration templates are ToolBook examples — free to use in any project.
              Check the individual dataset page for the exact license.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
