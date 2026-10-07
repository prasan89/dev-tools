'use client';

import { useState, useCallback, useRef } from 'react';
import { ToolDefinition, ToolProcessor } from '@/types/tool';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { DiffData, DiffLine, DiffWord } from '@/lib/processors/diff-checker';

interface DiffWorkspaceProps {
  tool: ToolDefinition;
  processor: ToolProcessor;
}

type Layout = 'split' | 'unified';

export function DiffWorkspace({ tool, processor }: DiffWorkspaceProps) {
  const [original, setOriginal] = useState('');
  const [changed, setChanged] = useState('');
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout>('split');
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runDiff = useCallback(
    (orig: string, chng: string, hide: boolean) => {
      if (!orig.trim() && !chng.trim()) {
        setDiffData(null);
        setError(null);
        setHasRun(false);
        return;
      }
      try {
        const result = processor.process({
          value: orig,
          secondary: chng,
          options: { hideUnchanged: hide, hideWhitespace: false },
        });
        if (result.error) {
          setError(result.error);
          setDiffData(null);
        } else if (result.output?.value) {
          setDiffData(JSON.parse(result.output.value) as DiffData);
          setError(null);
          trackEvent('tool_executed', { tool: tool.id });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
        setDiffData(null);
      }
      setHasRun(true);
    },
    [processor, tool.id]
  );

  const scheduleRun = useCallback(
    (orig: string, chng: string, hide: boolean) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runDiff(orig, chng, hide), 300);
    },
    [runDiff]
  );

  const handleOriginalChange = (v: string) => {
    setOriginal(v);
    if (processor.autoProcess !== false) scheduleRun(v, changed, hideUnchanged);
  };

  const handleChangedChange = (v: string) => {
    setChanged(v);
    if (processor.autoProcess !== false) scheduleRun(original, v, hideUnchanged);
  };

  const handleHideUnchanged = (v: boolean) => {
    setHideUnchanged(v);
    if (diffData) scheduleRun(original, changed, v);
  };

  const handleLoadExample = () => {
    const orig = processor.exampleInput ?? '';
    const chng = processor.exampleSecondary ?? '';
    setOriginal(orig);
    setChanged(chng);
    runDiff(orig, chng, hideUnchanged);
  };

  const handleClear = () => {
    setOriginal('');
    setChanged('');
    setDiffData(null);
    setError(null);
    setHasRun(false);
  };

  const handleFindDifference = () => runDiff(original, changed, hideUnchanged);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    trackEvent('tool_copied', { tool: tool.id });
  };

  const stats = diffData?.stats;
  const showDiff = hasRun && (diffData || error);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Split / Unified toggle */}
          <div className="flex rounded-lg border border-[#E5E2DC] overflow-hidden text-xs font-medium">
            <button
              type="button"
              onClick={() => setLayout('split')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                layout === 'split'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setLayout('unified')}
              className={cn(
                'px-3 py-1.5 transition-colors border-l border-[#E5E2DC]',
                layout === 'unified'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              Unified
            </button>
          </div>

          {/* Hide unchanged toggle */}
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideUnchanged}
              onChange={e => handleHideUnchanged(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 accent-gray-800"
            />
            Hide unchanged lines
          </label>
        </div>

        <div className="flex items-center gap-3">
          {processor.exampleInput && (
            <button
              type="button"
              onClick={handleLoadExample}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Load sample
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            disabled={!original && !changed}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {showDiff && stats && (
        <div className="flex items-center gap-4 text-xs px-1">
          {stats.removed > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px]">−</span>
              {stats.removed} {stats.removed === 1 ? 'removal' : 'removals'}
            </span>
          )}
          {stats.added > 0 && (
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 text-[10px]">+</span>
              {stats.added} {stats.added === 1 ? 'addition' : 'additions'}
            </span>
          )}
          {stats.removed === 0 && stats.added === 0 && (
            <span className="text-gray-500">No differences — texts are identical</span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main panels */}
      {!showDiff ? (
        // Input mode: two editable panels
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputPanel
            label="Original text"
            value={original}
            onChange={handleOriginalChange}
            onCopy={() => copyText(original)}
          />
          <InputPanel
            label="Changed text"
            value={changed}
            onChange={handleChangedChange}
            onCopy={() => copyText(changed)}
          />
        </div>
      ) : layout === 'split' ? (
        // Split diff view
        diffData && <SplitDiffView data={diffData} />
      ) : (
        // Unified diff view
        diffData && <UnifiedDiffView data={diffData} />
      )}

      {/* Action row */}
      <div className="flex items-center justify-center gap-3">
        {processor.autoProcess === false && !showDiff && (
          <button
            type="button"
            onClick={handleFindDifference}
            disabled={!original.trim() || !changed.trim()}
            className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Find difference
          </button>
        )}
        {showDiff && (
          <button
            type="button"
            onClick={() => { setHasRun(false); setDiffData(null); setError(null); }}
            className="rounded-xl border border-[#E5E2DC] bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Edit inputs
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input panel with line numbers
// ---------------------------------------------------------------------------

function InputPanel({
  label, value, onChange, onCopy,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCopy: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = value.split('\n');

  const syncScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E2DC]">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={`Copy ${label}`}
        >
          Copy
        </button>
      </div>
      <div className="flex flex-1 min-h-[380px] overflow-hidden font-mono text-[13px] leading-6">
        {/* Line number gutter */}
        <div
          ref={gutterRef}
          className="select-none text-right pr-3 pl-3 pt-4 text-gray-300 bg-gray-50/50 overflow-hidden shrink-0 min-w-[3rem]"
          style={{ overflowY: 'hidden' }}
        >
          {lines.map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
          {/* Extra padding line */}
          <div className="leading-6 invisible">0</div>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder={`Paste ${label.toLowerCase()} here…`}
          aria-label={label}
          className="flex-1 resize-none outline-none bg-transparent pt-4 pb-4 pr-4 text-gray-800 placeholder:text-gray-300 leading-6 overflow-auto"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Split diff view
// ---------------------------------------------------------------------------

function SplitDiffView({ data }: { data: DiffData }) {
  // Build parallel left/right row arrays
  const leftRows: (DiffLine | null)[] = [];
  const rightRows: (DiffLine | null)[] = [];

  // Group removed/added pairs to align them
  const lines = data.lines;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === 'unchanged') {
      leftRows.push(line);
      rightRows.push(line);
      i++;
    } else if (line.type === 'removed') {
      // Collect consecutive removed then added
      const removed: DiffLine[] = [];
      const added: DiffLine[] = [];
      while (i < lines.length && lines[i].type === 'removed') { removed.push(lines[i]); i++; }
      while (i < lines.length && lines[i].type === 'added') { added.push(lines[i]); i++; }
      const maxLen = Math.max(removed.length, added.length);
      for (let k = 0; k < maxLen; k++) {
        leftRows.push(removed[k] ?? null);
        rightRows.push(added[k] ?? null);
      }
    } else {
      // standalone added
      leftRows.push(null);
      rightRows.push(line);
      i++;
    }
  }

  return (
    <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden">
      {/* Headers */}
      <div className="grid grid-cols-2 border-b border-[#E5E2DC]">
        <div className="flex items-center justify-between px-4 py-2.5 border-r border-[#E5E2DC]">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-red-500">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-[10px]">−</span>
            {data.stats.removed} {data.stats.removed === 1 ? 'removal' : 'removals'}
          </span>
          <span className="text-[11px] text-gray-400">{leftRows.filter(Boolean).length} lines</span>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-green-600">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-[10px]">+</span>
            {data.stats.added} {data.stats.added === 1 ? 'addition' : 'additions'}
          </span>
          <span className="text-[11px] text-gray-400">{rightRows.filter(Boolean).length} lines</span>
        </div>
      </div>

      {/* Diff rows */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 font-mono text-[13px] leading-6 min-w-0">
          {leftRows.map((leftLine, idx) => {
            const rightLine = rightRows[idx];
            return (
              <SplitRowPair key={idx} left={leftLine} right={rightLine} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SplitRowPair({ left, right }: { left: DiffLine | null; right: DiffLine | null }) {
  return (
    <>
      {/* Left cell */}
      <div className={cn(
        'flex border-r border-[#E5E2DC]',
        left?.type === 'removed' ? 'bg-red-50 dark:bg-red-950/20' : '',
        left?.type === 'unchanged' ? '' : '',
        !left ? 'bg-gray-50/30' : '',
      )}>
        <div className="select-none w-10 shrink-0 text-right pr-3 pl-2 py-0.5 text-gray-300 text-[11px] leading-6 border-r border-[#E5E2DC]">
          {left?.lineNumLeft ?? ''}
        </div>
        <div className="px-3 py-0.5 whitespace-pre overflow-hidden flex-1 min-w-0">
          {left ? <DiffLineContent line={left} side="left" /> : null}
        </div>
      </div>
      {/* Right cell */}
      <div className={cn(
        'flex',
        right?.type === 'added' ? 'bg-green-50 dark:bg-green-950/20' : '',
        !right ? 'bg-gray-50/30' : '',
      )}>
        <div className="select-none w-10 shrink-0 text-right pr-3 pl-2 py-0.5 text-gray-300 text-[11px] leading-6 border-r border-[#E5E2DC]">
          {right?.lineNumRight ?? ''}
        </div>
        <div className="px-3 py-0.5 whitespace-pre overflow-hidden flex-1 min-w-0">
          {right ? <DiffLineContent line={right} side="right" /> : null}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Unified diff view
// ---------------------------------------------------------------------------

function UnifiedDiffView({ data }: { data: DiffData }) {
  let lineNum = 1;
  return (
    <div className="rounded-2xl border border-[#E5E2DC] bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#E5E2DC]">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-500">Unified Diff</span>
      </div>
      <div className="overflow-x-auto font-mono text-[13px] leading-6">
        {data.lines.map((line, idx) => {
          const num = lineNum++;
          return (
            <div
              key={idx}
              className={cn(
                'flex',
                line.type === 'removed' ? 'bg-red-50 dark:bg-red-950/20' : '',
                line.type === 'added' ? 'bg-green-50 dark:bg-green-950/20' : '',
              )}
            >
              <div className="select-none w-10 shrink-0 text-right pr-3 pl-2 py-0.5 text-gray-300 text-[11px] border-r border-[#E5E2DC]">
                {num}
              </div>
              <div className={cn(
                'px-3 py-0.5 shrink-0 w-5 font-bold',
                line.type === 'removed' ? 'text-red-500' : line.type === 'added' ? 'text-green-600' : 'text-gray-300',
              )}>
                {line.type === 'removed' ? '−' : line.type === 'added' ? '+' : ' '}
              </div>
              <div className="px-1 py-0.5 whitespace-pre overflow-hidden flex-1">
                <DiffLineContent line={line} side={line.type === 'removed' ? 'left' : 'right'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Line content — plain or word-highlighted
// ---------------------------------------------------------------------------

function DiffLineContent({ line, side }: { line: DiffLine; side: 'left' | 'right' }) {
  if (!line.words) {
    return <span className="text-gray-800">{line.content}</span>;
  }
  return (
    <>
      {line.words.map((w: DiffWord, i: number) => (
        <span
          key={i}
          className={w.changed
            ? side === 'left'
              ? 'bg-red-200 dark:bg-red-900/50 rounded-sm'
              : 'bg-green-200 dark:bg-green-900/50 rounded-sm'
            : undefined}
        >
          {w.text}
        </span>
      ))}
    </>
  );
}
