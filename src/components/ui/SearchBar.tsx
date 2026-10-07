'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { searchTools } from '@/lib/registry';
import { Tool } from '@/types/tool';
import Link from 'next/link';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo<Tool[]>(() => {
    if (query.length < 2) return [];
    return searchTools(query).slice(0, 6);
  }, [query]);

  const showDropdown = open && results.length > 0;

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
    if (e.key === 'Enter' && results.length > 0) {
      router.push(`/tools/${results[0].slug}`);
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <svg
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
            size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-gray-900',
            'border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
            'transition-shadow',
            size === 'large'
              ? 'pl-12 pr-4 py-3.5 text-base'
              : 'pl-10 pr-4 py-2 text-sm'
          )}
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {results.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {tool.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tool.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
