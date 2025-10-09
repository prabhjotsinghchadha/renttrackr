import { SignOutButton } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
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
    <BaseTemplate
      leftNav={
        <>
          <li>
            <Link
              href="/dashboard/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('dashboard_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/properties/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('properties_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/tenants/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('tenants_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/rents/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('rents_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/expenses/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('expenses_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/renovations/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('renovations_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/parking/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('parking_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/financials/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('financials_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      }
      rightNav={
        <>
          <li>
            <SignOutButton>
              <button
                className="font-semibold text-gray-700 transition-colors hover:text-blue-600"
                type="button"
              >
                {t('sign_out')}
              </button>
            </SignOutButton>
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      }
    >
      {props.children}
    </BaseTemplate>
  );
}
