import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'PDF to Excel — Extract Tables from PDF Online Free | DevToolsHub',
  description:
    'Extract tables from PDF files and convert to Excel (XLSX) format directly in your browser. No upload required — 100% private.',
  keywords: [
    'PDF to Excel',
    'PDF to XLSX',
    'extract table from PDF',
    'PDF table extractor',
    'convert PDF to spreadsheet',
    'PDF to Excel online',
    'PDF table to Excel free',
    'PDF data extraction',
    'PDF to Excel no upload',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/pdf-to-excel') },
  openGraph: {
    title: 'PDF to Excel — Extract Tables from PDF | DevToolsHub',
    description: 'Extract PDF tables to Excel (XLSX) in your browser. No upload, complete privacy.',
    url: siteUrl('/pdf-tools/pdf-to-excel'),
    type: 'website',
  },
};

export default function PdfToExcelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
