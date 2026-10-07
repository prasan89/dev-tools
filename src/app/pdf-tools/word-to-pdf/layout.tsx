import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Word to PDF — Free DOCX to PDF Converter Online | DevToolsHub',
  description:
    'Convert Word documents to PDF directly in your browser. No upload required. Supports DOCX and DOC files — paragraphs, headings, lists and tables. 100% private.',
  keywords: [
    'Word to PDF',
    'DOCX to PDF',
    'free Word to PDF',
    'convert Word to PDF online',
    'DOCX to PDF converter',
    'Word document to PDF',
    'DOC to PDF',
    'Word to PDF no upload',
    'browser Word to PDF',
    'free DOCX converter',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/word-to-pdf') },
  openGraph: {
    title: 'Word to PDF — Free DOCX to PDF Converter | DevToolsHub',
    description: 'Convert Word documents to PDF in your browser. No upload, no account, 100% private.',
    url: siteUrl('/pdf-tools/word-to-pdf'),
    type: 'website',
  },
};

export default function WordToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
