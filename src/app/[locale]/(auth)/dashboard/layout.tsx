import { SignOutButton } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
// import { CurrencySelector } from '@/components/CurrencySelector';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
// import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    // <CurrencyProvider>
    <BaseTemplate
      leftNav={
        <>
          <li>
            <Link
              href="/dashboard/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-400"
            >
              {t('dashboard_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/properties/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-400"
            >
              {t('properties_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/owners/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base dark:text-gray-200 dark:hover:bg-blue-900 dark:hover:text-blue-400"
            >
              {t('owners_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/tenants/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('tenants_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/rents/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('rents_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/expenses/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('expenses_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/renovations/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('renovations_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/parking/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('parking_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/financials/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('financials_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600 lg:text-sm xl:text-base"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      }
      rightNav={
        <>
          <li className="flex items-center">
            <SearchBar locale={locale} />
          </li>
          <li>
            <SignOutButton>
              <button
                className="block rounded-lg px-4 py-2 text-base font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-200 dark:hover:bg-red-900 dark:hover:text-red-400"
                type="button"
              >
                {t('sign_out')}
              </button>
            </SignOutButton>
          </li>

          {/* <li className="flex items-center">
              <CurrencySelector />
            </li> */}
          <li className="flex items-center">
            <ThemeToggle />
          </li>
          <li className="flex items-center">
            <LocaleSwitcher />
          </li>
        </>
      }
    >
      {props.children}
    </BaseTemplate>
    // </CurrencyProvider>
  );
}
