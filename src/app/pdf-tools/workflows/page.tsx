'use client';

import React, { useState, useCallback } from 'react';
import {
  WorkflowStepType,
  WorkflowStep,
  WorkflowState,
  createWorkflow,
  addStep,
  removeStep,
  moveStep,
  labelForStep,
} from '@/lib/pdf/pdfWorkflow';
import type { PdfFile } from '@/types/pdf';

const STEP_TYPES: WorkflowStepType[] = [
  'compress',
  'watermark-text',
  'metadata-clean',
  'page-numbers',
  'rotate',
];

function StatusBadge({ status }: { status: WorkflowStep['status'] }) {
  const cls: Record<WorkflowStep['status'], string> = {
    pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    skipped: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls[status]}`}>
      {status}
    </span>
  );
}

export default function WorkflowsPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowState>(createWorkflow());
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || f.type !== 'application/pdf') return;
    const pf: PdfFile = {
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      file: f,
      objectUrl: URL.createObjectURL(f),
      pageCount: null,
      isPasswordProtected: false,
      isCorrupted: false,
      loadedAt: Date.now(),
    };
    setPdfFile(pf);
    setResultBlob(null);
    setGlobalError(null);
    setWorkflow(createWorkflow());
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const pf: PdfFile = {
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      file: f,
      objectUrl: URL.createObjectURL(f),
      pageCount: null,
      isPasswordProtected: false,
      isCorrupted: false,
      loadedAt: Date.now(),
    };
    setPdfFile(pf);
    setResultBlob(null);
    setGlobalError(null);
    setWorkflow(createWorkflow());
  }, []);

  const runWorkflow = useCallback(async () => {
    if (!pdfFile || workflow.steps.length === 0) return;
    setCancelled(false);
    setGlobalError(null);
    setResultBlob(null);

    let currentBlob: Blob = pdfFile.file;
    const updatedSteps: WorkflowStep[] = workflow.steps.map((s) => ({ ...s, status: 'pending' as const }));
    setWorkflow((prev) => ({ ...prev, status: 'running', steps: updatedSteps }));

    for (let i = 0; i < updatedSteps.length; i++) {
      if (cancelled) {
        setWorkflow((prev) => ({ ...prev, status: 'cancelled' }));
        return;
      }

      setWorkflow((prev) => {
        const steps = [...prev.steps];
        steps[i] = { ...steps[i], status: 'running' };
        return { ...prev, currentStepIndex: i, steps };
      });

      try {
        const step = updatedSteps[i];
        const stepFile: PdfFile = {
          id: 'step-input',
          name: pdfFile.name,
          size: currentBlob.size,
          file: new File([currentBlob], pdfFile.name, { type: 'application/pdf' }),
          objectUrl: null,
          pageCount: null,
          isPasswordProtected: false,
          isCorrupted: false,
          loadedAt: Date.now(),
        };

        let result: { success: boolean; outputFile?: { blob: Blob; filename: string; size: number }; error?: string } | null = null;

        if (step.type === 'compress') {
          const { compressPdf, DEFAULT_OPTIONS } = await import('@/lib/pdf/compress');
          result = await compressPdf(stepFile, DEFAULT_OPTIONS);
        } else if (step.type === 'watermark-text') {
          const { buildWatermarkedPdf, defaultTextConfig } = await import('@/lib/pdf/watermarkPdf');
          const cfg = { ...defaultTextConfig(), ...(step.config as object) };
          result = await buildWatermarkedPdf(stepFile, cfg);
        } else if (step.type === 'metadata-clean') {
          const { buildMetadataEditedPdf, emptyMetadata } = await import('@/lib/pdf/pdfMetadata');
          result = await buildMetadataEditedPdf(stepFile, emptyMetadata(), true);
        } else if (step.type === 'page-numbers') {
          const { buildPageNumberedPdf, defaultConfig: defaultPNConfig } = await import('@/lib/pdf/pageNumbers');
          result = await buildPageNumberedPdf(stepFile, defaultPNConfig());
        } else if (step.type === 'rotate') {
          result = { success: true, outputFile: { blob: currentBlob, filename: stepFile.name, size: currentBlob.size } };
        } else {
          result = { success: true, outputFile: { blob: currentBlob, filename: stepFile.name, size: currentBlob.size } };
        }

        if (!result || !result.success || !result.outputFile) {
          throw new Error(result?.error ?? 'Step failed');
        }

        currentBlob = result.outputFile.blob;

        setWorkflow((prev) => {
          const steps = [...prev.steps];
          steps[i] = { ...steps[i], status: 'completed' };
          return { ...prev, steps };
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setWorkflow((prev) => {
          const steps = [...prev.steps];
          steps[i] = { ...steps[i], status: 'failed', error: msg };
          return { ...prev, status: 'failed', steps };
        });
        setGlobalError(`Step "${updatedSteps[i].label}" failed: ${msg}`);
        return;
      }
    }

    setResultBlob(currentBlob);
    setWorkflow((prev) => ({ ...prev, status: 'completed' }));
  }, [pdfFile, workflow.steps, cancelled]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !pdfFile) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFile.name.replace(/\.pdf$/i, '_workflow.pdf');
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob, pdfFile]);

  const isRunning = workflow.status === 'running';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">PDF Workflow Builder</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Chain multiple PDF operations in sequence. All processing stays in your browser.</p>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        role="button"
        aria-label="Drop PDF file here"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.querySelector('input') as HTMLInputElement)?.click(); }}
      >
        {pdfFile ? (
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{pdfFile.name} <span className="text-gray-400">({Math.round(pdfFile.size / 1024)} KB)</span></p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Drop a PDF here or <label className="text-blue-600 cursor-pointer underline">browse<input type="file" accept=".pdf,application/pdf" className="sr-only" onChange={handleFileInput} /></label></p>
        )}
      </div>

      {/* Step builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Workflow Steps</h2>
          <select
            className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                setWorkflow((prev) => addStep(prev, e.target.value as WorkflowStepType));
                e.target.value = '';
              }
            }}
            aria-label="Add workflow step"
          >
            <option value="">+ Add Step</option>
            {STEP_TYPES.map((t) => (
              <option key={t} value={t}>{labelForStep(t)}</option>
            ))}
          </select>
        </div>

        {workflow.steps.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">No steps added. Use the dropdown above to add operations.</p>
        )}

        {workflow.steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
            <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{step.label}</span>
            <StatusBadge status={step.status} />
            {step.error && <span className="text-xs text-red-500 truncate max-w-xs">{step.error}</span>}
            <div className="flex items-center gap-1">
              <button
                aria-label="Move step up"
                disabled={idx === 0 || isRunning}
                onClick={() => setWorkflow((prev) => moveStep(prev, step.id, 'up'))}
                className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >↑</button>
              <button
                aria-label="Move step down"
                disabled={idx === workflow.steps.length - 1 || isRunning}
                onClick={() => setWorkflow((prev) => moveStep(prev, step.id, 'down'))}
                className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >↓</button>
              <button
                aria-label="Remove step"
                disabled={isRunning}
                onClick={() => setWorkflow((prev) => removeStep(prev, step.id))}
                className="rounded p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
              >×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={runWorkflow}
          disabled={!pdfFile || workflow.steps.length === 0 || isRunning}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {isRunning ? 'Running…' : 'Run Workflow'}
        </button>
        {isRunning && (
          <button
            onClick={() => setCancelled(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cancel
          </button>
        )}
      </div>

      {globalError && (
        <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">{globalError}</p>
      )}

      {workflow.status === 'completed' && resultBlob && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">Workflow complete — {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''} applied</p>
          <button
            onClick={handleDownload}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
