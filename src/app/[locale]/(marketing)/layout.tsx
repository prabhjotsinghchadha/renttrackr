import { setRequestLocale } from 'next-intl/server';
import { MarketingLayoutClient } from '@/components/MarketingLayoutClient';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <MarketingLayoutClient locale={locale}>{props.children}</MarketingLayoutClient>;
}
