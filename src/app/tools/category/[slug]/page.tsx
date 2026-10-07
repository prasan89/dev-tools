import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getCategoryBySlug,
  getCategories,
  getToolsByCategory,
  getCategoryColors,
} from '@/lib/registry';
import { ToolCard } from '@/components/ui/ToolCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { cn } from '@/lib/utils';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCategories().map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} — DevToolsHub`,
    description: `Free online ${category.name.toLowerCase()}. ${category.description}`,
    alternates: { canonical: `/tools/category/${slug}` },
    openGraph: {
      title: `${category.name} — DevToolsHub`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.id);
  const allCategories = getCategories().filter((c) => c.id !== category.id);
  const colors = getCategoryColors(category.color);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub-lenl7h57yq-uc.a.run.app';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: category.name, url: `${SITE_URL}/tools/category/${slug}` },
      ])} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: category.name },
        ]}
        className="mb-6"
      />

      {/* Category header */}
      <header className="mb-8">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold',
              'bg-white dark:bg-gray-900 border',
              colors.border,
              colors.text
            )}
            aria-hidden="true"
          >
            {category.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {category.description}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
            </p>
          </div>
        </div>
      </header>

      {/* Tool grid */}
      {tools.length > 0 ? (
        <section aria-labelledby="tools-heading">
          <h2
            id="tools-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            All {category.name}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tools available in this category yet.
        </p>
      )}

      {/* Related categories */}
      {allCategories.length > 0 && (
        <section className="mt-12" aria-labelledby="other-categories-heading">
          <h2
            id="other-categories-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Other Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const c = getCategoryColors(cat.color);
              return (
                <Link
                  key={cat.id}
                  href={`/tools/category/${cat.slug}`}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors hover:shadow-sm',
                    c.border,
                    c.bg,
                    c.text
                  )}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
