'use client';

import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type HeaderNavProps = {
  locale: string;
};

export function HeaderNav({ locale }: HeaderNavProps) {
  const { isLoaded, user } = useUser();
  const t = useTranslations('RootLayout');

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <nav className="flex gap-4">
        <div className="rounded-lg border-2 border-gray-300 bg-transparent px-6 py-3 text-xl font-semibold text-gray-400 dark:border-gray-600 dark:text-gray-500">
          Loading...
        </div>
      </nav>
    );
  }

  const isAuthenticated = !!user;

  // Construct localized dashboard URL
  const dashboardUrl = locale === 'en' ? '/dashboard/' : `/${locale}/dashboard/`;

  return (
    <nav className="flex gap-4">
      {isAuthenticated ? (
        <Link
          href={dashboardUrl}
          className="rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 text-xl font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
        >
          {t('dashboard_link')}
        </Link>
      ) : (
        <Link
          href="/sign-in/"
          className="rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 text-xl font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
        >
          {t('sign_in_link')}
        </Link>
      )}
    </nav>
  );
}
