'use client';

import { MarketingHeader } from '@/components/MarketingHeader';

type MarketingLayoutClientProps = {
  locale: string;
  children: React.ReactNode;
};

export function MarketingLayoutClient({ locale, children }: MarketingLayoutClientProps) {
  return (
    <>
      {/* Header */}
      <MarketingHeader locale={locale} />

      {/* Main Content */}
      <main className="w-full">{children}</main>
    </>
  );
}
