export type WorkflowStepType =
  | 'compress'
  | 'watermark-text'
  | 'metadata-clean'
  | 'page-numbers'
  | 'rotate'
  | 'redact-none';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  label: string;
  config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
}

export interface WorkflowState {
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export function createWorkflow(): WorkflowState {
  return { steps: [], currentStepIndex: -1, status: 'idle' };
}

export function labelForStep(type: WorkflowStepType): string {
  const labels: Record<WorkflowStepType, string> = {
    'compress': 'Compress PDF',
    'watermark-text': 'Add Text Watermark',
    'metadata-clean': 'Remove Metadata',
    'page-numbers': 'Add Page Numbers',
    'rotate': 'Rotate Pages',
    'redact-none': 'Apply Redactions',
  };
  return labels[type];
}

export function defaultConfigForStep(type: WorkflowStepType): Record<string, unknown> {
  switch (type) {
    case 'compress':
      return { level: 'medium' };
    case 'watermark-text':
      return { text: 'CONFIDENTIAL', opacity: 0.25, position: 'diagonal', fontSize: 48 };
    case 'metadata-clean':
      return { clearAll: true };
    case 'page-numbers':
      return { position: 'bottom-center', format: 'Page {n}', fontSize: 10, startNumber: 1 };
    case 'rotate':
      return { degrees: 90, pageSelection: 'all' };
    case 'redact-none':
      return { rects: [] };
  }
}

export function addStep(state: WorkflowState, type: WorkflowStepType): WorkflowState {
  const step: WorkflowStep = {
    id: crypto.randomUUID(),
    type,
    label: labelForStep(type),
    config: defaultConfigForStep(type),
    status: 'pending',
  };
  return { ...state, steps: [...state.steps, step] };
}

export function removeStep(state: WorkflowState, id: string): WorkflowState {
  return { ...state, steps: state.steps.filter((s) => s.id !== id) };
}

export function moveStep(
  state: WorkflowState,
  id: string,
  direction: 'up' | 'down',
): WorkflowState {
  const idx = state.steps.findIndex((s) => s.id === id);
  if (idx === -1) return state;
  const target = direction === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= state.steps.length) return state;
  const steps = [...state.steps];
  [steps[idx], steps[target]] = [steps[target], steps[idx]];
  return { ...state, steps };
}
