import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to HTML — Convert PDF to HTML Online Free | DevToolsHub',
  description:
    'Convert PDF pages to HTML format directly in your browser. Preserves text positions and page layout. 100% private — your PDF never leaves your device.',
  keywords: ['PDF to HTML', 'convert PDF to HTML', 'PDF HTML extractor', 'PDF to web page', 'extract HTML from PDF'],
  alternates: { canonical: siteUrl('/pdf-tools/pdf-to-html') },
  openGraph: {
    title: 'PDF to HTML | DevToolsHub',
    description: 'Convert PDF to HTML in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-html'),
    type: 'website',
  },
};

export default function PdfToHtmlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
