'use client';

import { useState, useCallback } from 'react';
import { ToolDefinition, ToolInput as ToolInputType, ToolResult } from '@/types/tool';
import { getProcessor } from '@/lib/processors/index';
import { ToolInput } from '@/components/ui/ToolInput';
import { ToolOutput } from '@/components/ui/ToolOutput';
import { CopyButton } from '@/components/ui/CopyButton';
import { ClearButton } from '@/components/ui/ClearButton';
import { DownloadButton } from '@/components/ui/DownloadButton';
import { PrivacyNotice } from '@/components/ui/PrivacyNotice';
import { trackEvent } from '@/lib/analytics';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const [input, setInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [result, setResult] = useState<ToolResult | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const processor = getProcessor(tool.id);

  const runProcessor = useCallback(
    (inputValue: string, secondaryValue?: string) => {
      if (!processor) return;
      const toolInput: ToolInputType = { value: inputValue, secondary: secondaryValue };
      try {
        const r = processor.process(toolInput);
        setResult(r);
        if (!r.error) {
          trackEvent('tool_executed', { tool: tool.id });
        } else {
          trackEvent('tool_error', { tool: tool.id, error: r.error });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected error';
        setResult({ error: msg });
        trackEvent('tool_error', { tool: tool.id, error: msg });
      }
      setHasRun(true);
    },
    [processor, tool.id]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (processor?.autoProcess !== false && value) {
        runProcessor(value, secondaryInput);
      } else if (!value) {
        setResult(null);
        setHasRun(false);
      }
    },
    [processor, runProcessor, secondaryInput]
  );

  const handleSecondaryChange = useCallback(
    (value: string) => {
      setSecondaryInput(value);
      if (processor?.autoProcess !== false && input) {
        runProcessor(input, value);
      }
    },
    [processor, runProcessor, input]
  );

  const handleClear = () => {
    setInput('');
    setSecondaryInput('');
    setResult(null);
    setHasRun(false);
  };

  const handleLoadExample = () => {
    if (!processor?.exampleInput) return;
    const ex = processor.exampleInput;
    const exSec = processor.exampleSecondary ?? '';
    setInput(ex);
    setSecondaryInput(exSec);
    if (processor.autoProcess !== false) {
      runProcessor(ex, exSec);
    } else {
      setResult(null);
      setHasRun(false);
    }
  };

  const outputValue = result?.output?.value ?? '';
  const hasOutput = !!outputValue && !result?.error;
  const showActions = !!processor;

  // No processor = coming-soon state
  if (!processor) {
    return <ComingSoon tool={tool} />;
  }

  return (
    <div className="space-y-4">
      {tool.privacySensitive && <PrivacyNotice />}

      {/* Input — single or side-by-side (dual) layout */}
      {processor.hasSecondaryInput ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolInput
            value={input}
            onChange={handleInputChange}
            placeholder={processor.inputPlaceholder ?? 'Paste JSON here…'}
            label={processor.inputLabel ?? 'Input A'}
            rows={12}
          />
          <ToolInput
            value={secondaryInput}
            onChange={handleSecondaryChange}
            label={processor.secondaryInputLabel ?? 'Input B'}
            rows={12}
          />
        </div>
      ) : (
        <ToolInput
          value={input}
          onChange={handleInputChange}
          placeholder={processor.inputPlaceholder ?? `Paste your input here…`}
          label={processor.inputLabel ?? 'Input'}
          rows={10}
        />
      )}

      {/* Action bar */}
      {showActions && (
        <div className="flex flex-wrap items-center gap-2">
          <ClearButton onClick={handleClear} disabled={!input && !secondaryInput} />
          {processor.exampleInput && (
            <button
              onClick={handleLoadExample}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Load Example
            </button>
          )}
          {hasOutput && (
            <>
              <CopyButton
                text={outputValue}
                onCopy={() => trackEvent('tool_copied', { tool: tool.id })}
              />
              {result?.output?.downloadFilename && (
                <DownloadButton
                  content={outputValue}
                  filename={result.output.downloadFilename}
                  mimeType={result.output.downloadMime}
                  onDownload={() => trackEvent('tool_downloaded', { tool: tool.id })}
                />
              )}
            </>
          )}
          {/* Manual run button for processors that don't auto-process */}
          {processor.autoProcess === false && (
            <button
              onClick={() => runProcessor(input, secondaryInput)}
              disabled={!input || (processor.hasSecondaryInput && !secondaryInput)}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Run
            </button>
          )}
        </div>
      )}

      {/* Warnings */}
      {result?.warnings?.map((w, i) => (
        <div
          key={i}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
        >
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {w.message}
        </div>
      ))}

      {/* Output */}
      {(hasRun || result?.error) && (
        <ToolOutput
          value={outputValue}
          label={result?.output?.label ?? 'Output'}
          error={result?.error}
          rows={10}
          showCopy={false}
        />
      )}

      {/* Additional outputs */}
      {result?.additionalOutputs?.map((ao, i) => (
        <ToolOutput
          key={i}
          value={ao.value}
          label={ao.label}
          rows={5}
          showCopy={ao.copyable}
        />
      ))}

      {/* Result meta (stats) */}
      {result?.meta && Object.keys(result.meta).length > 0 && (
        <dl className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          {Object.entries(result.meta).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="font-medium capitalize text-gray-700 dark:text-gray-300">
                {k.replace(/_/g, ' ')}
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coming-soon state (shown when processor is undefined)
// ---------------------------------------------------------------------------

function ComingSoon({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6">
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
            <strong>{tool.name}</strong> is part of our upcoming tool suite. The interface
            and architecture is ready — the processor will be implemented shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
