import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, getEnabledTools, getCategoryById } from '@/lib/registry';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';
import { ToolErrorBoundary } from '@/components/tools/ToolErrorBoundary';
import { JsonLd, webApplicationSchema, breadcrumbSchema } from '@/components/seo/JsonLd';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render all enabled tools at build time
export async function generateStaticParams() {
  return getEnabledTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || !tool.enabled) return { title: 'Tool Not Found' };

  const category = getCategoryById(tool.category);
  const canonical = `/tools/${slug}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${tool.seoTitle} — DevToolsHub`,
      description: tool.seoDescription,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.seoTitle} — DevToolsHub`,
      description: tool.seoDescription,
    },
    keywords: tool.keywords,
    other: {
      'article:section': category?.name ?? '',
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  // Return 404 for unknown or disabled tools
  if (!tool || !tool.enabled) notFound();

  const category = getCategoryById(tool.category);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub-lenl7h57yq-uc.a.run.app';

  return (
    <ToolLayout tool={tool}>
      <JsonLd data={webApplicationSchema(tool)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        ...(category ? [{ name: category.name, url: `${SITE_URL}/tools/category/${category.slug}` }] : []),
        { name: tool.name, url: `${SITE_URL}/tools/${slug}` },
      ])} />
      <ToolErrorBoundary toolName={tool.name}>
        <ToolWorkspace tool={tool} />
      </ToolErrorBoundary>
    </ToolLayout>
  );
}
