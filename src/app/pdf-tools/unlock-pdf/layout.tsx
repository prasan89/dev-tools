import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Unlock PDF — Remove PDF Password Online Free | DevToolsHub',
  description:
    'Remove the password from a PDF file instantly. Decrypt and unlock password-protected PDFs in your browser. No uploads, complete privacy.',
  keywords: [
    'unlock PDF',
    'remove PDF password',
    'decrypt PDF',
    'PDF password remover',
    'unlock PDF online',
    'remove PDF encryption',
    'PDF unlock free',
    'decrypt PDF online',
    'PDF password unlocker',
    'unlock PDF no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/unlock-pdf'),
  },
  openGraph: {
    title: 'Unlock PDF — Remove PDF Password Online | DevToolsHub',
    description:
      'Remove the password from any PDF. Decrypt and unlock password-protected files in your browser. Never uploaded.',
    url: siteUrl('/pdf-tools/unlock-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Unlock PDF Online Free | DevToolsHub',
    description:
      'Remove password from PDF instantly. Browser-based, no upload, complete privacy.',
  },
};

export default function UnlockPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
