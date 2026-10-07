import { ToolDefinition } from '@/types/tool';
import { getRelatedTools } from '@/lib/registry';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  tool: ToolDefinition;
}

export function RelatedTools({ tool }: RelatedToolsProps) {
  const related = getRelatedTools(tool);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading">
      <h2
        id="related-tools-heading"
        className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        Related Tools
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
