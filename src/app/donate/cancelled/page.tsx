import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Payment Not Completed — ToolBook' },
  robots: { index: false, follow: false },
};

export default function DonateCancelledPage() {
  return (
    <main className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="text-5xl mb-6" aria-hidden="true">💙</div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Payment Not Completed
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Your payment wasn&apos;t completed. No worries — you can try again whenever you&apos;d like.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-colors"
        >
          ❤️ Try Again
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-6 py-3 transition-colors"
        >
          Back to ToolBook
        </Link>
      </div>
    </main>
  );
}
