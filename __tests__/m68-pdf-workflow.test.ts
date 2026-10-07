/**
 * M68 — PDF Workflow tests
 */

import {
  createWorkflow,
  addStep,
  removeStep,
  moveStep,
  defaultConfigForStep,
  labelForStep,
} from '../src/lib/pdf/pdfWorkflow';
import type { WorkflowStepType } from '../src/lib/pdf/pdfWorkflow';

const ALL_STEP_TYPES: WorkflowStepType[] = [
  'compress',
  'watermark-text',
  'metadata-clean',
  'page-numbers',
  'rotate',
  'redact-none',
];

describe('createWorkflow', () => {
  it('returns idle status', () => {
    expect(createWorkflow().status).toBe('idle');
  });

  it('returns empty steps array', () => {
    expect(createWorkflow().steps).toHaveLength(0);
  });

  it('returns currentStepIndex -1', () => {
    expect(createWorkflow().currentStepIndex).toBe(-1);
  });
});

describe('addStep', () => {
  it('adds a step to empty workflow', () => {
    const state = addStep(createWorkflow(), 'compress');
    expect(state.steps).toHaveLength(1);
  });

  it('added step has correct type', () => {
    const state = addStep(createWorkflow(), 'watermark-text');
    expect(state.steps[0].type).toBe('watermark-text');
  });

  it('added step has pending status', () => {
    const state = addStep(createWorkflow(), 'compress');
    expect(state.steps[0].status).toBe('pending');
  });

  it('added step has non-empty label', () => {
    const state = addStep(createWorkflow(), 'page-numbers');
    expect(state.steps[0].label.length).toBeGreaterThan(0);
  });

  it('added step has a string id', () => {
    const state = addStep(createWorkflow(), 'compress');
    expect(typeof state.steps[0].id).toBe('string');
    expect(state.steps[0].id.length).toBeGreaterThan(0);
  });

  it('added step has non-empty config', () => {
    const state = addStep(createWorkflow(), 'watermark-text');
    expect(Object.keys(state.steps[0].config).length).toBeGreaterThan(0);
  });

  it('adds multiple steps', () => {
    let state = createWorkflow();
    state = addStep(state, 'compress');
    state = addStep(state, 'watermark-text');
    state = addStep(state, 'page-numbers');
    expect(state.steps).toHaveLength(3);
  });

  it('does not mutate original state', () => {
    const original = createWorkflow();
    addStep(original, 'compress');
    expect(original.steps).toHaveLength(0);
  });
});

describe('removeStep', () => {
  it('removes a step by id', () => {
    let state = addStep(createWorkflow(), 'compress');
    const id = state.steps[0].id;
    state = removeStep(state, id);
    expect(state.steps).toHaveLength(0);
  });

  it('removes only the targeted step', () => {
    let state = addStep(createWorkflow(), 'compress');
    state = addStep(state, 'watermark-text');
    const firstId = state.steps[0].id;
    state = removeStep(state, firstId);
    expect(state.steps).toHaveLength(1);
    expect(state.steps[0].type).toBe('watermark-text');
  });

  it('is a no-op for unknown id', () => {
    const state = addStep(createWorkflow(), 'compress');
    const result = removeStep(state, 'nonexistent-id');
    expect(result.steps).toHaveLength(1);
  });
});

describe('moveStep', () => {
  it('moves a step up', () => {
    let state = addStep(createWorkflow(), 'compress');
    state = addStep(state, 'watermark-text');
    const secondId = state.steps[1].id;
    state = moveStep(state, secondId, 'up');
    expect(state.steps[0].type).toBe('watermark-text');
    expect(state.steps[1].type).toBe('compress');
  });

  it('moves a step down', () => {
    let state = addStep(createWorkflow(), 'compress');
    state = addStep(state, 'watermark-text');
    const firstId = state.steps[0].id;
    state = moveStep(state, firstId, 'down');
    expect(state.steps[0].type).toBe('watermark-text');
    expect(state.steps[1].type).toBe('compress');
  });

  it('does not move first step up (no-op)', () => {
    let state = addStep(createWorkflow(), 'compress');
    state = addStep(state, 'watermark-text');
    const firstId = state.steps[0].id;
    const result = moveStep(state, firstId, 'up');
    expect(result.steps[0].type).toBe('compress');
  });

  it('does not move last step down (no-op)', () => {
    let state = addStep(createWorkflow(), 'compress');
    state = addStep(state, 'watermark-text');
    const lastId = state.steps[1].id;
    const result = moveStep(state, lastId, 'down');
    expect(result.steps[1].type).toBe('watermark-text');
  });

  it('is a no-op for unknown id', () => {
    const state = addStep(createWorkflow(), 'compress');
    const result = moveStep(state, 'bad-id', 'up');
    expect(result.steps).toHaveLength(1);
  });
});

describe('defaultConfigForStep', () => {
  it.each(ALL_STEP_TYPES)('returns non-empty config for %s', (type) => {
    const config = defaultConfigForStep(type);
    expect(Object.keys(config).length).toBeGreaterThan(0);
  });

  it('watermark-text config has text and opacity', () => {
    const config = defaultConfigForStep('watermark-text');
    expect(config.text).toBeTruthy();
    expect(typeof config.opacity).toBe('number');
  });

  it('page-numbers config has position and format', () => {
    const config = defaultConfigForStep('page-numbers');
    expect(config.position).toBeTruthy();
    expect(config.format).toBeTruthy();
  });

  it('compress config has level', () => {
    const config = defaultConfigForStep('compress');
    expect(config.level).toBeTruthy();
  });
});

describe('labelForStep', () => {
  it.each(ALL_STEP_TYPES)('returns non-empty label for %s', (type) => {
    const label = labelForStep(type);
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
  });

  it('compress label mentions compress', () => {
    expect(labelForStep('compress').toLowerCase()).toMatch(/compress/);
  });

  it('watermark-text label mentions watermark', () => {
    expect(labelForStep('watermark-text').toLowerCase()).toMatch(/watermark/);
  });
});

describe('workflows layout metadata', () => {
  it('title contains workflow', async () => {
    const mod = await import('../src/app/pdf-tools/workflows/layout');
    expect(String(mod.metadata.title).toLowerCase()).toMatch(/workflow/);
  });

  it('keywords include workflow-related terms', async () => {
    const mod = await import('../src/app/pdf-tools/workflows/layout');
    const kws = (mod.metadata.keywords as string[]).join(' ').toLowerCase();
    expect(kws).toMatch(/workflow|chain|multi-step/);
  });

  it('canonical url contains workflows', async () => {
    const mod = await import('../src/app/pdf-tools/workflows/layout');
    const canonical = (mod.metadata.alternates as { canonical: string }).canonical;
    expect(canonical).toContain('workflows');
  });
});
