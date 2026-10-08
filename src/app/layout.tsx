import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/components/layout/Providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { AdSenseConditional } from '@/components/ads/AdSenseConditional';
import { SITE_URL, SITE_NAME, siteUrl } from '@/lib/seo/site-config';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'DevToolsHub — Free Online Developer Tools',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free online developer tools for JSON, encoding, Base64, URL, date & time, regex, SQL, XML, YAML, text processing and more. All tools run in your browser — no data sent to servers.',
  keywords: [
    'developer tools',
    'online tools',
    'json formatter',
    'base64 encoder',
    'url encoder',
    'regex tester',
    'sql formatter',
    'timestamp converter',
    'json validator',
  ],
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    url: siteUrl('/'),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-[#FAF9F6] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <GoogleAnalytics />
        <AdSenseConditional />
        <ServiceWorkerRegistration />
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
            &copy; 2025 DevToolsHub &mdash;{' '}
            <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Privacy</a>
            {' · '}
            <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">Terms</a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
