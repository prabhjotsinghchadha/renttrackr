import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      {/* Header */}
      <header className="w-full bg-white px-6 py-6 shadow-sm md:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            🏠 RentTrackr
          </Link>
          <HeaderNav locale={locale} />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">{props.children}</main>
    </>
  );
}
