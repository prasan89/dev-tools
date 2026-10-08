import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
                DT
              </span>
              <span className="font-bold text-sm">DevToolsHub</span>
            </Link>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Fast, free, privacy-friendly tools for developers. All processing happens in your browser.
            </p>
          </div>

          <div className="flex gap-12 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">Site</p>
              <ul className="space-y-1.5 text-gray-500 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2">Legal</p>
              <ul className="space-y-1.5 text-gray-500 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
          <p className="text-xs text-center text-gray-400 dark:text-gray-600">
            &copy; 2025 DevToolsHub. Free developer tools.
          </p>
        </div>
      </div>
    </footer>
  );
}
