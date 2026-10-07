import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF Workflow Builder — Chain Multiple PDF Tools Online Free | DevToolsHub',
  description:
    'Build multi-step PDF workflows in your browser. Chain compress, watermark, metadata cleanup, page numbers and more into a single automated workflow. 100% private — your PDF never leaves your device.',
  keywords: [
    'PDF workflow',
    'chain PDF tools',
    'multi-step PDF processing',
    'PDF automation',
    'PDF pipeline',
    'PDF batch workflow',
    'combine PDF operations',
    'PDF workflow builder',
    'automate PDF',
    'PDF tools chain',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/workflows'),
  },
  openGraph: {
    title: 'PDF Workflow Builder — Chain PDF Tools | DevToolsHub',
    description:
      'Chain multiple PDF operations into a workflow. Compress, watermark, clean metadata, add page numbers — all in your browser.',
    url: siteUrl('/pdf-tools/workflows'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Workflow Builder | DevToolsHub',
    description: 'Build multi-step PDF workflows. All processing stays in your browser — never uploaded.',
  },
};

export default function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
