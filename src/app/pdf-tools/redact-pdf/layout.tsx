import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Redact PDF — Black Out Text & Images Online Free | DevToolsHub',
  description:
    'Redact sensitive text and areas from PDF files directly in your browser. Draw redaction boxes over any content. 100% private — your PDF never leaves your device.',
  keywords: [
    'redact PDF',
    'black out PDF text',
    'remove text from PDF',
    'PDF redaction tool',
    'PDF redact online',
    'censor PDF',
    'hide text PDF',
    'PDF black box',
    'redact PDF free',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/redact-pdf'),
  },
  openGraph: {
    title: 'Redact PDF — Black Out Text & Images | DevToolsHub',
    description: 'Redact PDF content in your browser. Draw over sensitive areas and export. Never uploaded.',
    url: siteUrl('/pdf-tools/redact-pdf'),
    type: 'website',
  },
};

export default function RedactPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
