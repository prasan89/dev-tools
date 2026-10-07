import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, getEnabledTools, getCategoryById } from '@/lib/registry';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ToolWorkspace } from '@/components/tools/ToolWorkspace';
import { ToolErrorBoundary } from '@/components/tools/ToolErrorBoundary';

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

  return (
    <ToolLayout tool={tool}>
      <ToolErrorBoundary toolName={tool.name}>
        <ToolWorkspace tool={tool} />
      </ToolErrorBoundary>
    </ToolLayout>
  );
}
