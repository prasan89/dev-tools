import Link from 'next/link';
import { CATEGORIES } from '@/lib/registry';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
                DT
              </span>
              <span className="font-bold text-sm">DevToolsHub</span>
            </Link>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Fast, free, privacy-friendly tools for developers. All processing happens in your
              browser.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Tools
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/?category=${cat.id}`}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Site
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/robots.txt"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Robots.txt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Privacy
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No data is sent to our servers. All tool processing happens locally in your browser.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-xs text-center text-gray-400 dark:text-gray-600">
            &copy; 2025 DevToolsHub. Free developer tools.
          </p>
        </div>
      </div>
    </footer>
  );
}
