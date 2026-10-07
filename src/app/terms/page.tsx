import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of use for DevToolsHub — free developer tools.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: October 2026</p>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Acceptance</h2>
          <p>
            By using DevToolsHub, you agree to these terms. If you do not agree, please do not use
            the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Use of Service</h2>
          <p>DevToolsHub provides free, browser-based developer tools. You may use these tools for any lawful purpose. You may not:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Attempt to reverse-engineer, scrape, or systematically access the service in ways that would overload it</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to circumvent any security measures</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">No Warranty</h2>
          <p>
            DevToolsHub is provided &ldquo;as is&rdquo; without warranty of any kind. We make no
            guarantees about accuracy, availability, or fitness for a particular purpose. Always
            validate critical output independently before using it in production.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Limitation of Liability</h2>
          <p>
            DevToolsHub shall not be liable for any direct, indirect, incidental, or consequential
            damages arising from the use or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Intellectual Property</h2>
          <p>
            The DevToolsHub name, logo, and site design are owned by DevToolsHub. The tools
            themselves are provided free of charge for developer use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the service after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact</h2>
          <p>
            Questions about these terms? See our{' '}
            <a href="/contact" className="text-blue-600 dark:text-blue-400 underline">contact page</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
