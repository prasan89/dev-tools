import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the DevToolsHub team.',
  alternates: { canonical: '/contact' },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact</h1>

      <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">

        <p>
          Have a question, bug report, or tool suggestion? We&apos;d love to hear from you.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Report a Bug</h2>
          <p>
            If a tool produces incorrect output or behaves unexpectedly, please describe the issue
            including the input you used and the output you expected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Suggest a Tool</h2>
          <p>
            We&apos;re actively expanding the tool library. If there&apos;s a developer utility
            you&apos;d like to see, let us know.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Privacy Questions</h2>
          <p>
            For questions about our data practices, see our{' '}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 underline">Privacy Policy</a>.
          </p>
        </section>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Get in touch</p>
          <p className="text-gray-500 dark:text-gray-400">
            Open an issue or discussion on our GitHub repository — it&apos;s the fastest way to reach us.
          </p>
        </div>

      </div>
    </div>
  );
}
