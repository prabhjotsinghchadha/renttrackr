import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { OwnerManagement } from '@/components/OwnerManagement';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await props.params;

  return {
    title: 'Owner Management',
    description: 'Manage property owners and ownership entities',
  };
}

export default async function OwnersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto py-8 md:py-12">
      <OwnerManagement locale={locale} />
    </div>
  );
}

