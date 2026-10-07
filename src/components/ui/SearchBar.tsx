'use client';

import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { searchTools } from '@/lib/registry';
import { Tool } from '@/types/tool';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface SearchBarProps {
  className?: string;
  size?: 'default' | 'large';
  placeholder?: string;
}

export function SearchBar({
  className,
  size = 'default',
  placeholder = 'Search tools...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const inputId = useId();
  const listId = useId();

  const results = useMemo<Tool[]>(() => {
    if (query.length < 2) return [];
    return searchTools(query).slice(0, 6);
  }, [query]);

  const showDropdown = open && results.length > 0;

  // Reset active index when results change
  useEffect(() => { setActiveIndex(-1); }, [results]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          const selected = results[activeIndex];
          trackEvent('search_performed', {
            result_count: results.length,
            selected_slug: selected.slug,
          });
          router.push(`/tools/${selected.slug}`);
        } else if (results.length > 0) {
          const first = results[0];
          trackEvent('search_performed', {
            result_count: results.length,
            selected_slug: first.slug,
          });
          router.push(`/tools/${first.slug}`);
        } else {
          trackEvent('search_performed', { result_count: 0 });
        }
        setOpen(false);
        setQuery('');
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const activeOptionId = activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">Search developer tools</label>
      <div className="relative" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox" aria-owns={listId}>
        <svg
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
            size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={activeOptionId}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-gray-900',
            'border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
            'transition-shadow',
            size === 'large' ? 'pl-12 pr-4 py-3.5 text-base' : 'pl-10 pr-4 py-2 text-sm'
          )}
        />
      </div>

      {/* Results dropdown */}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Search results"
        className={cn(
          'absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg',
          !showDropdown && 'hidden'
        )}
      >
        {results.map((tool, i) => (
          <li
            key={tool.slug}
            id={`${listId}-option-${i}`}
            role="option"
            aria-selected={i === activeIndex}
          >
            <Link
              href={`/tools/${tool.slug}`}
              onClick={() => {
                trackEvent('search_performed', {
                  result_count: results.length,
                  selected_slug: tool.slug,
                });
                setOpen(false);
                setQuery('');
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 transition-colors',
                i === activeIndex
                  ? 'bg-blue-50 dark:bg-blue-950/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
              tabIndex={-1}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" aria-hidden="true">
                {tool.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tool.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Screen reader live announcement */}
      {query.length >= 2 && (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {results.length > 0
            ? `${results.length} result${results.length > 1 ? 's' : ''} found`
            : 'No results found'}
        </p>
      )}
    </div>
  );
}
