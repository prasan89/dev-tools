export interface CoreWebVitalsTargets {
  LCP: number;
  /** INP (Interaction to Next Paint) replaced FID as a Core Web Vital in March 2024. */
  INP: number;
  CLS: number;
  FCP: number;
  TTFB: number;
}

export const WEB_VITALS_TARGETS: CoreWebVitalsTargets = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
};

export type VitalStatus = 'good' | 'needs-improvement' | 'poor';

export function getLcpStatus(ms: number): VitalStatus {
  if (ms <= 2500) return 'good';
  if (ms <= 4000) return 'needs-improvement';
  return 'poor';
}

export function getClsStatus(score: number): VitalStatus {
  if (score <= 0.1) return 'good';
  if (score <= 0.25) return 'needs-improvement';
  return 'poor';
}

/** INP thresholds per Google's March 2024 Core Web Vitals update. */
export function getInpStatus(ms: number): VitalStatus {
  if (ms <= 200) return 'good';
  if (ms <= 500) return 'needs-improvement';
  return 'poor';
}

export function getFcpStatus(ms: number): VitalStatus {
  if (ms <= 1800) return 'good';
  if (ms <= 3000) return 'needs-improvement';
  return 'poor';
}

export function getVitalStatusLabel(status: VitalStatus): string {
  const labels: Record<VitalStatus, string> = {
    good: 'Good',
    'needs-improvement': 'Needs Improvement',
    poor: 'Poor',
  };
  return labels[status];
}
