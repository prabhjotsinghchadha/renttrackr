import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  // Check if user is authenticated
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  // Construct localized dashboard URL
  const dashboardUrl = locale === 'en' ? '/dashboard/' : `/${locale}/dashboard/`;

  return (
    <>
      {/* Header */}
      <header className="w-full bg-white px-6 py-6 shadow-sm md:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            🏠 RentTrackr
          </Link>
          <nav className="flex gap-4">
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                className="rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 text-xl font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
              >
                {t('dashboard_link')}
              </Link>
            ) : (
              <Link
                href="/sign-in/"
                className="rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 text-xl font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
              >
                {t('sign_in_link')}
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">{props.children}</main>
    </>
  );
}
