import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Excel to PDF — Free XLSX to PDF Converter Online | DevToolsHub',
  description:
    'Convert Excel spreadsheets to PDF directly in your browser. No upload required. Select sheets, page size and orientation. 100% private.',
  keywords: [
    'Excel to PDF',
    'XLSX to PDF',
    'free Excel to PDF',
    'convert Excel to PDF online',
    'XLSX to PDF converter',
    'spreadsheet to PDF',
    'Excel PDF no upload',
    'browser Excel to PDF',
    'XLS to PDF',
    'free XLSX converter',
  ],
  alternates: { canonical: siteUrl('/pdf-tools/excel-to-pdf') },
  openGraph: {
    title: 'Excel to PDF — Free XLSX to PDF Converter | DevToolsHub',
    description: 'Convert Excel spreadsheets to PDF in your browser. No upload, no account, 100% private.',
    url: siteUrl('/pdf-tools/excel-to-pdf'),
    type: 'website',
  },
};

export default function ExcelToPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
