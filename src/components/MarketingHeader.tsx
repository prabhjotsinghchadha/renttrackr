'use client';

import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { ThemeToggle } from '@/components/ThemeToggle';

type MarketingHeaderProps = {
  locale: string;
};

export function MarketingHeader({ locale }: MarketingHeaderProps) {
  return (
    <header className="w-full bg-white px-6 py-6 shadow-sm md:px-12 lg:px-16 xl:px-24 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          🏠 RentTrackr
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <HeaderNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
