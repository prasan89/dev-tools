import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to PowerPoint — Convert PDF to PPTX Online Free | DevToolsHub',
  description:
    'Convert PDF pages to PowerPoint slides (PPTX) directly in your browser. Each page becomes a slide. No upload — 100% private.',
  keywords: [
    'PDF to PowerPoint',
    'PDF to PPTX',
    'convert PDF to PowerPoint',
    'PDF to slides',
    'PDF to presentation',
    'PDF PowerPoint online free',
    'PDF to PPTX no upload',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/pdf-to-powerpoint') },
  openGraph: {
    title: 'PDF to PowerPoint — Convert PDF to PPTX | DevToolsHub',
    description: 'Convert PDF pages to PowerPoint slides in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/pdf-to-powerpoint'),
    type: 'website',
  },
};

export default function PdfToPowerpointLayout({ children }: { children: React.ReactNode }) {
  return children;
}
