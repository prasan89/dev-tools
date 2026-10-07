import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, TOOLS } from '@/lib/registry';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { PlaceholderTool } from './PlaceholderTool';

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: tool.seo?.title || `${tool.name} — DevToolsHub`,
    description: tool.seo?.description || tool.description,
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      title: tool.seo?.title || `${tool.name} — DevToolsHub`,
      description: tool.seo?.description || tool.description,
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PlaceholderTool tool={tool} />
    </ToolLayout>
  );
}
