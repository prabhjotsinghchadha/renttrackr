import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { getUserTenants } from '@/actions/TenantActions';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Tenants',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function TenantsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Tenants',
  });

  // Fetch tenants from database
  const result = await getUserTenants();
  const tenants = result.tenants || [];

  return (
    <div className="py-8 md:py-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">{t('page_title')}</h1>
        <Link
          href="/dashboard/tenants/new"
          className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {t('add_tenant')}
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-12 text-center md:p-20">
          <div className="mb-6 text-8xl">👥</div>
          <h3 className="mb-4 text-2xl font-semibold text-gray-800">{t('no_tenants')}</h3>
          <p className="mb-8 text-xl leading-relaxed text-gray-600">
            {t('no_tenants_description')}
          </p>
          <Link
            href="/dashboard/tenants/new"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            {t('add_first_tenant')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/dashboard/tenants/${tenant.id}`}
              className="group rounded-xl bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 text-5xl">👤</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                {tenant.name}
              </h3>
              {tenant.email && (
                <p className="mb-1 text-gray-600">
                  {t('email')}: {tenant.email}
                </p>
              )}
              {tenant.phone && (
                <p className="mb-1 text-gray-600">
                  {t('phone')}: {tenant.phone}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {t('tenant_since')}: {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
