'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ToolDefinition, ToolInput as ToolInputType, ToolResult, ToolOptionControl, ToolProcessor } from '@/types/tool';
import { getProcessor } from '@/lib/processors/index';
import { CopyButton } from '@/components/ui/CopyButton';
import { DownloadButton } from '@/components/ui/DownloadButton';
import { PrivacyNotice } from '@/components/ui/PrivacyNotice';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
}

function buildDefaultOptions(controls: ToolOptionControl[] | undefined): Record<string, unknown> {
  if (!controls) return {};
  const opts: Record<string, unknown> = {};
  for (const c of controls) opts[c.key] = c.defaultValue;
  return opts;
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const [input, setInput] = useState('');
  const [secondaryInput, setSecondaryInput] = useState('');
  const [result, setResult] = useState<ToolResult | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [hasTrackedUse, setHasTrackedUse] = useState(false);
  const [processor, setProcessor] = useState<ToolProcessor | undefined>(undefined);
  const [processorLoading, setProcessorLoading] = useState(true);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getProcessor(tool.id).then((p) => {
      if (!cancelled) {
        setProcessor(p);
        if (p?.optionControls) setOptions(buildDefaultOptions(p.optionControls));
        setProcessorLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tool.id]);

  const runProcessor = useCallback(
    (inputValue: string, secondaryValue?: string, opts?: Record<string, unknown>) => {
      if (!processor) return;
      const toolInput: ToolInputType = { value: inputValue, secondary: secondaryValue, options: opts };
      try {
        const r = processor.process(toolInput);
        setResult(r);
        if (!r.error) {
          trackEvent('tool_executed', { tool: tool.id });
          if (!hasTrackedUse) {
            trackEvent('tool_used', { tool_slug: tool.id, tool_name: tool.name, category: tool.category });
            setHasTrackedUse(true);
          }
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
    [processor, tool.id, tool.name, tool.category, hasTrackedUse]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (processor?.autoProcess !== false && value) {
        runProcessor(value, secondaryInput, options);
      } else if (!value) {
        setResult(null);
        setHasRun(false);
      }
    },
    [processor, runProcessor, secondaryInput, options]
  );

  const handleSecondaryChange = useCallback(
    (value: string) => {
      setSecondaryInput(value);
      if (processor?.autoProcess !== false && input) runProcessor(input, value, options);
    },
    [processor, runProcessor, input, options]
  );

  const handleOptionChange = useCallback(
    (key: string, value: unknown) => {
      const newOpts = { ...options, [key]: value };
      setOptions(newOpts);
      if (processor?.autoProcess !== false && input) runProcessor(input, secondaryInput, newOpts);
    },
    [options, processor, input, secondaryInput, runProcessor]
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
      runProcessor(ex, exSec, options);
    } else {
      setResult(null);
      setHasRun(false);
    }
  };

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleInputChange(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const outputValue = result?.output?.value ?? '';
  const hasOutput = !!outputValue && !result?.error;

  if (processorLoading) {
    return (
      <>
        <p className="sr-only" aria-live="polite" aria-atomic="true">Loading tool, please wait.</p>
        <ProcessorSkeleton />
      </>
    );
  }

  if (!processor) return <ComingSoon tool={tool} />;

  return (
    <div className="space-y-4">
      {tool.privacySensitive && <PrivacyNotice />}

      {/* Option controls */}
      {processor.optionControls && processor.optionControls.length > 0 && (
        <OptionControls controls={processor.optionControls} values={options} onChange={handleOptionChange} />
      )}

      {/* Two-panel workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* INPUT panel */}
        <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E2DC]">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
              {processor.hasSecondaryInput ? (processor.inputLabel ?? 'Input') : 'Input'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </button>
              <input ref={fileInputRef} type="file" accept="text/*,.json,.xml,.yaml,.yml,.csv,.txt,.md" className="sr-only" onChange={handleFileChange} />
              {processor.exampleInput && (
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Load sample
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                disabled={!input && !secondaryInput}
                className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
          <WorkspaceTextarea
            value={input}
            onChange={handleInputChange}
            placeholder={processor.inputPlaceholder ?? 'Paste your input here…'}
            label={processor.inputLabel ?? 'Input'}
          />
        </div>

        {/* OUTPUT panel */}
        <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E2DC]">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
              Output
            </span>
            <div className="flex items-center gap-2">
              {result?.output?.downloadFilename && hasOutput && (
                <DownloadButton
                  content={outputValue}
                  filename={result.output.downloadFilename}
                  mimeType={result.output.downloadMime}
                  onDownload={() => trackEvent('tool_downloaded', { tool: tool.id })}
                  variant="ghost"
                />
              )}
              <CopyButton
                text={outputValue}
                onCopy={() => trackEvent('tool_copied', { tool: tool.id })}
                variant="solid"
              />
            </div>
          </div>
          <OutputArea
            value={outputValue}
            error={result?.error}
            hasRun={hasRun}
            label={result?.output?.label ?? 'Output'}
          />
        </div>
      </div>

      {/* Secondary input (for dual-input tools like jsonpath-tester) */}
      {processor.hasSecondaryInput && (
        <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#E5E2DC]">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">
              {processor.secondaryInputLabel ?? 'Secondary Input'}
            </span>
          </div>
          <WorkspaceTextarea
            value={secondaryInput}
            onChange={handleSecondaryChange}
            placeholder="Enter secondary input…"
            label={processor.secondaryInputLabel ?? 'Secondary Input'}
          />
        </div>
      )}

      {/* Manual run button */}
      {processor.autoProcess === false && (
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Run tool"
            onClick={() => runProcessor(input, secondaryInput, options)}
            disabled={!input || (processor.hasSecondaryInput && !secondaryInput)}
            className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Run
          </button>
        </div>
      )}

      {/* Warnings */}
      {result?.warnings?.map((w, i) => (
        <div
          key={i}
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
        >
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {w.message}
        </div>
      ))}

      {/* Additional outputs */}
      {result?.additionalOutputs?.map((ao, i) => (
        <div key={i} className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E2DC]">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">{ao.label}</span>
            {ao.copyable && <CopyButton text={ao.value} variant="ghost" />}
          </div>
          <OutputArea value={ao.value} hasRun={true} label={ao.label ?? 'Output'} />
        </div>
      ))}

      {/* Meta stats */}
      {result?.meta && Object.keys(result.meta).length > 0 && (
        <dl className="flex flex-wrap gap-x-6 gap-y-2 px-1 text-xs text-gray-500">
          {Object.entries(result.meta).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <dt className="font-medium capitalize text-gray-600">{k.replace(/_/g, ' ')}</dt>
              <dd className="text-gray-500">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workspace textarea (no outer card — the panel wraps it)
// ---------------------------------------------------------------------------

interface WorkspaceTextareaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
}

function WorkspaceTextarea({ value, onChange, placeholder, label }: WorkspaceTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className={cn(
        'flex-1 w-full min-h-[320px] resize-none px-5 py-4',
        'font-mono text-[13px] leading-relaxed',
        'text-gray-800 placeholder:text-gray-300',
        'bg-transparent focus:outline-none',
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Output area
// ---------------------------------------------------------------------------

interface OutputAreaProps {
  value: string;
  error?: string;
  hasRun: boolean;
  label: string;
}

function OutputArea({ value, error, hasRun, label }: OutputAreaProps) {
  const placeholder = hasRun ? '' : `${label} will appear here.`;

  if (error) {
    return (
      <div
        role="alert"
        className="flex-1 min-h-[320px] px-5 py-4 font-mono text-[13px] leading-relaxed text-red-600 bg-red-50/50"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[320px] px-5 py-4 bg-[#F5F4F0]">
      <pre className="font-mono text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
        {value || <span className="text-gray-400">{placeholder}</span>}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option Controls
// ---------------------------------------------------------------------------

interface OptionControlsProps {
  controls: ToolOptionControl[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function OptionControls({ controls, values, onChange }: OptionControlsProps) {
  const groups = new Map<string, ToolOptionControl[]>();
  const ungrouped: ToolOptionControl[] = [];

  for (const c of controls) {
    if (c.type === 'checkbox' && c.group) {
      const g = groups.get(c.group) ?? [];
      g.push(c);
      groups.set(c.group, g);
    } else {
      ungrouped.push(c);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#E5E2DC] bg-white px-4 py-3">
      {ungrouped.map((c) => {
        if (c.showWhen && String(values[c.showWhen.key] ?? '') !== c.showWhen.value) return null;
        if (c.type === 'select') {
          return (
            <div key={c.key} className="flex items-center gap-2">
              <label htmlFor={`opt-${c.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                {c.label}
              </label>
              <select
                id={`opt-${c.key}`}
                value={String(values[c.key] ?? c.defaultValue)}
                onChange={(e) => onChange(c.key, e.target.value)}
                className="rounded-lg border border-[#E5E2DC] bg-white px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                {c.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          );
        }
        if (c.type === 'text') {
          return (
            <div key={c.key} className="flex items-center gap-2">
              <label htmlFor={`opt-${c.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                {c.label}
              </label>
              <input
                id={`opt-${c.key}`}
                type="text"
                value={String(values[c.key] ?? c.defaultValue)}
                placeholder={c.placeholder ?? ''}
                onChange={(e) => onChange(c.key, e.target.value)}
                className="rounded-lg border border-[#E5E2DC] bg-white px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 w-40"
              />
            </div>
          );
        }
        if (c.type === 'textarea') {
          return (
            <div key={c.key} className="flex flex-col gap-1 w-full">
              <label htmlFor={`opt-${c.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                {c.label}
              </label>
              <textarea
                id={`opt-${c.key}`}
                value={String(values[c.key] ?? c.defaultValue)}
                placeholder={c.placeholder ?? ''}
                onChange={(e) => onChange(c.key, e.target.value)}
                rows={3}
                className="rounded-lg border border-[#E5E2DC] bg-white px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 w-full"
              />
            </div>
          );
        }
        return (
          <label key={c.key} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(values[c.key] ?? c.defaultValue)}
              onChange={(e) => onChange(c.key, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 accent-gray-800"
            />
            <span className="text-xs text-gray-600">{c.label}</span>
          </label>
        );
      })}
      {Array.from(groups.entries()).map(([groupName, groupControls]) => (
        <fieldset key={groupName} className="flex items-center gap-1.5">
          <legend className="text-xs font-medium text-gray-400 mr-1.5">{groupName}:</legend>
          {groupControls.map((c) => (
            <label key={c.key} className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(values[c.key] ?? c.defaultValue)}
                onChange={(e) => onChange(c.key, e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-gray-800"
              />
              <span className="text-xs text-gray-600">{c.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ProcessorSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse" aria-busy="true" aria-label="Loading tool">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm h-[400px]" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coming-soon state
// ---------------------------------------------------------------------------

function ComingSoon({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h2 className="font-semibold text-amber-800">Coming Soon</h2>
          <p className="mt-1 text-sm text-amber-700">
            <strong>{tool.name}</strong> is part of our upcoming tool suite. The interface
            and architecture is ready — the processor will be implemented shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
