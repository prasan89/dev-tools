import { ToolDefinition } from '@/types/tool';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RelatedTools } from '@/components/ui/RelatedTools';
import { getCategoryById } from '@/lib/registry';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const category = getCategoryById(tool.category);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          ...(category
            ? [{ label: category.name, href: `/tools/category/${category.slug}` }]
            : []),
          { label: tool.name },
        ]}
        className="mb-6"
      />

      <header className="mb-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-hidden="true"
          >
            {tool.icon}
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tool.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tool.description}</p>
          </div>
        </div>
        {tool.longDescription && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {tool.longDescription}
          </p>
        )}
      </header>

      <main>{children}</main>

      {/* Related tools section — auto from registry */}
      <div className="mt-10">
        <RelatedTools tool={tool} />
      </div>
    </div>
  );
}
