import type { Metadata } from 'next';
import Link from 'next/link';
import { getEnabledTools } from '@/lib/registry';

export const metadata: Metadata = {
  title: 'About DevToolsHub',
  description: 'DevToolsHub is a collection of free, fast, privacy-friendly tools for developers.',
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const tools = getEnabledTools();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">About DevToolsHub</h1>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300">

        <section>
          <p className="text-base leading-relaxed">
            DevToolsHub is a free collection of {tools.length}+ developer utilities that run
            entirely in your browser. No sign-up. No upload. No server processing. Just fast,
            reliable tools that work anywhere.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Why DevToolsHub?</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
              <span><strong>Private by design.</strong> Your JSON, passwords, tokens, and queries never leave your device.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
              <span><strong>Fast.</strong> Static pages, lazy-loaded processors, and no unnecessary JavaScript.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
              <span><strong>No account required.</strong> Every tool works immediately without sign-up or API keys.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5" aria-hidden="true">✓</span>
              <span><strong>Always free.</strong> Core tools will always be free for individual developers.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">What We Build</h2>
          <p>
            We focus on the tools developers actually reach for every day — JSON formatters,
            Base64 encoders, JWT decoders, UUID generators, regex testers, SQL formatters, and
            more. Each tool is purpose-built to be genuinely useful, not a low-effort clone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Technology</h2>
          <p>
            DevToolsHub is built with Next.js, TypeScript, and Tailwind CSS. Tools are statically
            generated and processor libraries are lazily loaded only when needed — so visiting the
            JSON formatter does not load the SQL formatter&apos;s dependencies.
          </p>
        </section>

        <section className="flex gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Browse all tools →
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Contact us
          </Link>
        </section>

      </div>
    </div>
  );
}
