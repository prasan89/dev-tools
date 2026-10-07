'use client';

import { Tool } from '@/types/tool';
import { ToolInput } from '@/components/ui/ToolInput';
import { ToolOutput } from '@/components/ui/ToolOutput';
import { CopyButton } from '@/components/ui/CopyButton';
import { ClearButton } from '@/components/ui/ClearButton';
import { DownloadButton } from '@/components/ui/DownloadButton';
import { useState } from 'react';

interface PlaceholderToolProps {
  tool: Tool;
}

export function PlaceholderTool({ tool }: PlaceholderToolProps) {
  const [input, setInput] = useState('');

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h2 className="font-semibold text-amber-800 dark:text-amber-300">Coming Soon</h2>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
            <strong>{tool.name}</strong> is part of our upcoming tool suite. The interface and
            architecture is ready — the processor will be implemented in a future milestone.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 opacity-60 pointer-events-none select-none">
        <ToolInput
          value={input}
          onChange={setInput}
          placeholder={`Paste your input here for ${tool.name}...`}
          label="Input"
        />
        <div className="flex gap-2">
          <ClearButton onClick={() => setInput('')} disabled />
          <CopyButton text="" />
          <DownloadButton content="" filename="output.txt" disabled />
        </div>
        <ToolOutput value="" label="Output" />
      </div>
    </div>
  );
}
