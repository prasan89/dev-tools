import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/layout/Providers';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { AdSenseScript } from '@/components/ads/AdSenseScript';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'DevToolsHub — Developer Tools That Just Work',
    template: '%s — DevToolsHub',
  },
  description:
    'Fast, free, privacy-friendly tools for developers. JSON formatter, Base64 encoder, regex tester, UUID generator, and more.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://devtoolshub.dev'),
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'DevToolsHub',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-[#FAF9F6] dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <GoogleAnalytics />
        <AdSenseScript />
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
