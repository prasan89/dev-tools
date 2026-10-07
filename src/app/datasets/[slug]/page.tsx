import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getDatasets, getDatasetBySlug, getCategories } from '@/lib/datasets';
import { DatasetViewer } from '@/components/datasets/DatasetViewer';
import { DatasetCard } from '@/components/datasets/DatasetCard';
import { DatasetCategoryBadge } from '@/components/datasets/DatasetCategoryBadge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub-lenl7h57yq-uc.a.run.app';

interface DatasetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getDatasets().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DatasetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dataset = getDatasetBySlug(slug);
  if (!dataset) return { title: 'Dataset Not Found' };

  const canonical = `/datasets/${dataset.slug}`;

  return {
    title: dataset.seoTitle,
    description: dataset.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${dataset.seoTitle} — DevToolsHub`,
      description: dataset.seoDescription,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dataset.seoTitle} — DevToolsHub`,
      description: dataset.seoDescription,
    },
    keywords: dataset.tags,
  };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default async function DatasetDetailPage({ params }: DatasetPageProps) {
  const { slug } = await params;
  const dataset = getDatasetBySlug(slug);

  if (!dataset) notFound();

  const allDatasets = getDatasets();
  const categories = getCategories();
  const categoryInfo = categories.find((c) => c.id === dataset.category);

  // Related datasets (by slug references)
  const relatedDatasets = (dataset.relatedDatasets ?? [])
    .map((s) => allDatasets.find((d) => d.slug === s))
    .filter(Boolean)
    .slice(0, 3) as (typeof allDatasets)[number][];

  // First record for example JSON
  const firstRecord: unknown = Array.isArray(dataset.data) && dataset.data.length > 0
    ? dataset.data[0]
    : null;

  // Slice data to avoid serializing the full dataset into SSG HTML
  const PAGE_SIZE = 100;
  const totalRecords = dataset.data.length;
  const initialData = dataset.data.slice(0, PAGE_SIZE);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Datasets', url: `${SITE_URL}/datasets` },
        { name: dataset.name, url: `${SITE_URL}/datasets/${slug}` },
      ])} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Datasets', href: '/datasets' },
            { label: dataset.name },
          ]}
          className="mb-6"
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Header */}
            <header>
              <div className="flex items-center gap-2 mb-2">
                <DatasetCategoryBadge category={dataset.category} />
                {dataset.popular && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Popular
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dataset.name}
              </h1>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                {dataset.longDescription ?? dataset.description}
              </p>
            </header>

            {/* Dataset viewer (client island) */}
            <section aria-labelledby="viewer-heading">
              <h2 id="viewer-heading" className="sr-only">Dataset preview</h2>
              <DatasetViewer
                slug={dataset.slug}
                recordCount={dataset.recordCount}
                fileSizeBytes={dataset.fileSizeBytes}
                initialData={initialData}
                totalRecords={totalRecords}
              />
            </section>

            {/* SEO content: About */}
            <section aria-labelledby="about-heading" className="prose prose-sm dark:prose-invert max-w-none">
              <h2 id="about-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 not-prose mb-2">
                About this dataset
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {dataset.longDescription ?? dataset.description} The dataset contains{' '}
                {dataset.recordCount.toLocaleString()} records and is approximately{' '}
                {formatBytes(dataset.fileSizeBytes)} when serialized as JSON. It is released under
                the <strong>{dataset.license}</strong> license and sourced from{' '}
                {dataset.source}.
              </p>
            </section>

            {/* Example JSON */}
            {firstRecord !== null && (
              <section aria-labelledby="example-heading">
                <h2 id="example-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Example record
                </h2>
                <pre className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 text-gray-100 text-xs leading-relaxed p-4 overflow-auto font-mono whitespace-pre max-h-80">
                  {JSON.stringify(firstRecord, null, 2)}
                </pre>
              </section>
            )}

            {/* How to use */}
            <section aria-labelledby="how-to-use-heading">
              <h2 id="how-to-use-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                How to use
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Use the table view to browse records or switch to JSON view to see the raw
                structure. Click <strong>Download JSON</strong> to save the full file locally, or{' '}
                <strong>Copy JSON</strong> to paste it directly into your project. For CSV export,
                use the CSV download button — fields containing nested objects are serialized as
                JSON strings.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                You can also fetch it programmatically from the{' '}
                <Link href="/datasets" className="text-blue-600 dark:text-blue-400 hover:underline">
                  datasets page
                </Link>{' '}
                by downloading the JSON and hosting it alongside your project, or importing it
                directly into your test suite or mock server.
              </p>
            </section>

            {/* Related datasets */}
            {relatedDatasets.length > 0 && (
              <section aria-labelledby="related-datasets-heading">
                <h2 id="related-datasets-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Related Datasets
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedDatasets.map((d) => (
                    <DatasetCard key={d.slug} dataset={d} />
                  ))}
                </div>
              </section>
            )}

            {/* Related tools */}
            {dataset.relatedTools && dataset.relatedTools.length > 0 && (
              <section aria-labelledby="related-tools-heading">
                <h2 id="related-tools-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Related Tools
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dataset.relatedTools.map((toolSlug) => (
                    <Link
                      key={toolSlug}
                      href={`/tools/${toolSlug}`}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      {toolSlug
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-6">
            {/* Dataset metadata card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Dataset info
              </h2>
              <dl className="space-y-2">
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">Records</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                    {dataset.recordCount.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">File size</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                    {formatBytes(dataset.fileSizeBytes)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="text-right">
                    <DatasetCategoryBadge category={dataset.category} />
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">License</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                    {dataset.license}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">Source</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                    {dataset.source}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Fields schema */}
            {dataset.fields.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Fields
                </h2>
                <div className="space-y-2">
                  {dataset.fields.map((field) => (
                    <div key={field.name} className="text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="font-mono font-medium text-gray-900 dark:text-gray-100">
                          {field.name}
                        </code>
                        <span className="rounded px-1 py-0.5 text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 font-mono">
                          {field.type}
                        </span>
                      </div>
                      {field.description && (
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {dataset.tags.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category link */}
            {categoryInfo && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Browse category
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                  {categoryInfo.description}
                </p>
                <Link
                  href={`/datasets?category=${dataset.category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span aria-hidden="true">{categoryInfo.icon}</span>
                  More {categoryInfo.name} datasets
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
