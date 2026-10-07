import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MobileNav } from './MobileNav';
import { CATEGORIES, getEnabledTools } from '@/lib/registry';

export function Header() {
  const toolCount = getEnabledTools().length;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
            aria-label="DevToolsHub home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold select-none" aria-hidden="true">
              DT
            </span>
            <span className="hidden font-bold text-sm sm:block">DevToolsHub</span>
          </Link>

          {/* Search — center */}
          <div className="flex-1 max-w-md">
            <SearchBar placeholder={`Search ${toolCount}+ tools…`} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
            <MobileNav />
          </div>
        </div>

        {/* Category nav — desktop only */}
        <nav
          className="hidden sm:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none"
          aria-label="Tool categories"
        >
          <Link
            href="/"
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            All Tools
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools/category/${cat.slug}`}
              className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
