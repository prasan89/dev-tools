'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/registry';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label="Toggle navigation menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 sm:hidden"
      >
        {open ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          id="mobile-nav-menu"
          className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile tool categories">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              All Tools
            </Link>
            <Link
              href="/pdf-tools"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              PDF Tools
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/tools/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
