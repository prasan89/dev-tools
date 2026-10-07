import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo/site-config';

export const metadata: Metadata = {
  title: 'Password Protect PDF — Encrypt PDF Online Free | DevToolsHub',
  description:
    'Add a password to your PDF to restrict access. Set permissions for printing, copying, and editing. 100% browser-based — your PDF never leaves your device.',
  keywords: [
    'password protect PDF',
    'encrypt PDF',
    'PDF password protection',
    'PDF encryption online',
    'protect PDF with password',
    'add password to PDF',
    'PDF security',
    'PDF permissions',
    'encrypt PDF free',
    'password protect PDF no upload',
  ],
  alternates: {
    canonical: siteUrl('/pdf-tools/protect-pdf'),
  },
  openGraph: {
    title: 'Password Protect PDF — Encrypt PDF Online | DevToolsHub',
    description:
      'Encrypt your PDF with a password. Set permissions for printing and copying. Processed in your browser — never uploaded.',
    url: siteUrl('/pdf-tools/protect-pdf'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Password Protect PDF Free | DevToolsHub',
    description:
      'Add a password to any PDF. Set read/print/copy permissions. 100% browser-based, no upload.',
  },
};

export default function ProtectPdfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
