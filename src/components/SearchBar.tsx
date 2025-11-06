'use client';

import type {SearchResult} from '@/actions/SearchActions';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { globalSearch  } from '@/actions/SearchActions';

export function SearchBar({ locale }: { locale: string }) {
  const t = useTranslations('Search');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await globalSearch(query);
      if (searchResults.success) {
        setResults(searchResults.results);
        setIsOpen(searchResults.results.length > 0);
      }
      setIsLoading(false);
    }, 500); // Increased debounce for better performance

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || results.length === 0) {
        if (e.key === 'Enter' && query.trim().length >= 2 && results.length > 0 && results[0]) {
          // Navigate to first result or search page
          router.push(`/${locale}${results[0].href}`);
          setIsOpen(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length && results[selectedIndex]) {
            router.push(`/${locale}${results[selectedIndex].href}`);
            setIsOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, selectedIndex, locale, router, query],
  );

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return '🏠';
      case 'tenant':
        return '👤';
      case 'owner':
        return '👥';
      case 'expense':
        return '💰';
      case 'unit':
        return '🏢';
      case 'renovation':
        return '🔨';
      case 'action':
        return '⚡';
      case 'page':
        return '📄';
      default:
        return '📋';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return t('type_property');
      case 'tenant':
        return t('type_tenant');
      case 'owner':
        return t('type_owner');
      case 'expense':
        return t('type_expense');
      case 'unit':
        return t('type_unit');
      case 'renovation':
        return t('type_renovation');
      case 'action':
        return t('type_action');
      case 'page':
        return t('type_page');
      default:
        return type;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={t('placeholder')}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 pr-10 pl-10 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
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
        </div>
        {isLoading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto p-2">
            {results.map((result, index) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={`/${locale}${result.href}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
                className={`block rounded-lg px-4 py-3 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : result.type === 'action'
                      ? 'hover:bg-green-50 dark:hover:bg-green-900/20'
                      : result.type === 'page'
                        ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getTypeIcon(result.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{result.title}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {results.length >= 10 && (
            <div className="border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t('more_results')}
            </div>
          )}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {t('no_results')}
        </div>
      )}
    </div>
  );
}

