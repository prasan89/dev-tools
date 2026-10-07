import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How DevToolsHub handles your data. All tool processing is local — we never receive your input.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: October 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Overview</h2>
          <p>
            DevToolsHub is a collection of developer tools that run entirely in your browser. We are
            committed to your privacy and to keeping our data collection minimal and transparent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tool Processing</h2>
          <p>
            All tool processing on DevToolsHub happens locally in your browser using JavaScript.
            When you use a tool — whether formatting JSON, encoding Base64, testing a regex, or
            generating a password — your input data is <strong>never sent to our servers</strong>.
            We never see, receive, log, or store the content you enter into any tool.
          </p>
          <p className="mt-2">
            This means your sensitive data — passwords, JWT tokens, API keys, SQL queries,
            private JSON — stays private on your device.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Analytics</h2>
          <p>
            We use Google Analytics 4 to understand how visitors use the site. Analytics helps us
            answer questions like: how many people visit each day, which tools are most useful, and
            which countries visitors come from.
          </p>
          <p className="mt-2">What Google Analytics collects:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Pages visited and time spent on each page</li>
            <li>Approximate geographic location (country/region)</li>
            <li>Device type (desktop, mobile, tablet)</li>
            <li>Browser and operating system</li>
            <li>Referring website (how you found us)</li>
            <li>Which tools were used (by tool name only — never content)</li>
          </ul>
          <p className="mt-2">
            We configure analytics with IP anonymization enabled. We do not send the content of
            your tool inputs to analytics under any circumstances.
          </p>
          <p className="mt-2">
            You can opt out of Google Analytics by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              className="text-blue-600 dark:text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Advertising</h2>
          <p>
            DevToolsHub may display advertising through Google AdSense to support the cost of
            running the service. Google may use cookies to serve ads based on your prior visits to
            this site or other sites. You can opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              className="text-blue-600 dark:text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Cookies</h2>
          <p>
            DevToolsHub itself does not set first-party cookies. Google Analytics and Google
            AdSense may set cookies on their own behalf as described in{' '}
            <a
              href="https://policies.google.com/privacy"
              className="text-blue-600 dark:text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Google Analytics 4</strong> — usage analytics.{' '}
              <a href="https://policies.google.com/privacy" className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
            </li>
            <li>
              <strong>Google AdSense</strong> — advertising.{' '}
              <a href="https://policies.google.com/technologies/ads" className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">AdSense Privacy</a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Children</h2>
          <p>
            DevToolsHub is intended for developers and general technical users. We do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Changes</h2>
          <p>
            We may update this policy as the site evolves. Material changes will be noted with an
            updated date above.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Contact</h2>
          <p>
            Questions about this privacy policy? See our{' '}
            <a href="/contact" className="text-blue-600 dark:text-blue-400 underline">contact page</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
