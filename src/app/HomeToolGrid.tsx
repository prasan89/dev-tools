'use client';

import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { TOOLS } from '@/lib/registry';

export function HomeToolGrid() {
  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <SearchBar placeholder="Filter tools..." />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
