import { getToolBySlug } from '@/lib/registry';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  slugs: string[];
}

export function RelatedTools({ slugs }: RelatedToolsProps) {
  const tools = slugs.map((s) => getToolBySlug(s)).filter(Boolean);
  if (tools.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Related Tools</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => tool && <ToolCard key={tool.slug} tool={tool} />)}
      </div>
    </section>
  );
}
