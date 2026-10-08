import {
  WEB_VITALS_TARGETS,
  getLcpStatus,
  getClsStatus,
  getInpStatus,
  getFcpStatus,
  getVitalStatusLabel,
} from '../src/lib/performance';

describe('WEB_VITALS_TARGETS', () => {
  it('LCP target is 2500ms', () => { expect(WEB_VITALS_TARGETS.LCP).toBe(2500); });
  it('CLS target is 0.1', () => { expect(WEB_VITALS_TARGETS.CLS).toBe(0.1); });
  it('INP target is 200ms (replaced FID as of March 2024)', () => { expect(WEB_VITALS_TARGETS.INP).toBe(200); });
});

describe('getLcpStatus', () => {
  it('returns good for 2000ms', () => { expect(getLcpStatus(2000)).toBe('good'); });
  it('returns good at boundary 2500ms', () => { expect(getLcpStatus(2500)).toBe('good'); });
  it('returns needs-improvement for 3000ms', () => { expect(getLcpStatus(3000)).toBe('needs-improvement'); });
  it('returns poor for 5000ms', () => { expect(getLcpStatus(5000)).toBe('poor'); });
});

describe('getClsStatus', () => {
  it('returns good for 0.05', () => { expect(getClsStatus(0.05)).toBe('good'); });
  it('returns needs-improvement for 0.15', () => { expect(getClsStatus(0.15)).toBe('needs-improvement'); });
  it('returns poor for 0.3', () => { expect(getClsStatus(0.3)).toBe('poor'); });
});

describe('getInpStatus', () => {
  it('returns good for 150ms', () => { expect(getInpStatus(150)).toBe('good'); });
  it('returns good at boundary 200ms', () => { expect(getInpStatus(200)).toBe('good'); });
  it('returns needs-improvement for 300ms', () => { expect(getInpStatus(300)).toBe('needs-improvement'); });
  it('returns poor for 600ms', () => { expect(getInpStatus(600)).toBe('poor'); });
});

describe('getFcpStatus', () => {
  it('returns good for 1500ms', () => { expect(getFcpStatus(1500)).toBe('good'); });
  it('returns needs-improvement for 2500ms', () => { expect(getFcpStatus(2500)).toBe('needs-improvement'); });
  it('returns poor for 4000ms', () => { expect(getFcpStatus(4000)).toBe('poor'); });
});

describe('getVitalStatusLabel', () => {
  it('labels good correctly', () => { expect(getVitalStatusLabel('good')).toBe('Good'); });
  it('labels needs-improvement correctly', () => { expect(getVitalStatusLabel('needs-improvement')).toBe('Needs Improvement'); });
  it('labels poor correctly', () => { expect(getVitalStatusLabel('poor')).toBe('Poor'); });
});
